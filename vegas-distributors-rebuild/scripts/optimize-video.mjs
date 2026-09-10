/**
 * Builds the web derivatives for the campaign video.
 *
 * The owner's original is preserved untouched under src/assets/video-sources.
 * Everything this writes goes to src/assets/video and is committed, so a normal
 * build never needs ffmpeg. Re-run this only when the source changes.
 *
 * The audio track is carried through deliberately: the campaign is meant to be
 * heard. Browsers still refuse to start an unmuted video on their own, so the
 * player falls back to muted playback and offers a sound control; that is a
 * runtime concern rather than an encoding one.
 *
 * Usage: node scripts/optimize-video.mjs
 */
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src', 'assets', 'video-sources', 'score-with-jarana-original.mp4');
const OUT = join(ROOT, 'src', 'assets', 'video');

/** The frame that best represents the campaign: the product, in a named venue. */
const POSTER_AT = '10.3';

const has = (cmd) => {
  try { execFileSync(cmd, ['-version'], { stdio: 'ignore' }); return true; }
  catch { return false; }
};

if (!has('ffmpeg') || !has('ffprobe')) {
  console.error('ffmpeg and ffprobe are required to rebuild the video derivatives.');
  console.error('The committed files under src/assets/video are already current;');
  console.error('this script only needs to run when the source video changes.');
  process.exit(1);
}

if (!existsSync(SRC)) {
  console.error(`Missing source video: ${SRC}`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

const run = (args) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args]);
const mb = (p) => (statSync(p).size / 1048576).toFixed(2) + ' MB';

const probe = JSON.parse(
  execFileSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', SRC], {
    encoding: 'utf8',
  })
);
const video = probe.streams.find((s) => s.codec_type === 'video');
const audio = probe.streams.find((s) => s.codec_type === 'audio');
const width = video.width;
const height = video.height;
const duration = Number(probe.format.duration);

console.log(`Source: ${width}x${height}, ${duration.toFixed(1)}s, ${video.codec_name}` +
  (audio ? `, audio ${audio.codec_name} ${audio.channels}ch` : ', no audio'));

// Never upscale: the derivative is capped at the source's own resolution.
const target = Math.min(width, 720);
const scale = `scale=${target}:-2`;

/* Two derivatives.
 *
 * H.264 in MP4 is the one every browser and phone this site targets can play,
 * and faststart puts the index at the front so the opening frames arrive before
 * the rest of the file does.
 *
 * VP9 in WebM lands within a few hundred kilobytes of it on this grainy
 * handheld footage. Only H.264 is shipped: for this film VP9 came out larger
 * than H.264, so offering it first meant every browser that prefers WebM took
 * the bigger download, and the whole build no longer fitted in one upload. The
 * encode is kept below, switched off, because it is still what a Chromium
 * build without the proprietary H.264 decoder would need. */
run([
  '-i', SRC,
  '-vf', scale,
  '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '30',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  ...(audio ? ['-c:a', 'aac', '-b:a', '96k', '-ac', '2'] : ['-an']),
  join(OUT, 'score-with-jarana.mp4'),
]);
console.log(`  mp4    ${mb(join(OUT, 'score-with-jarana.mp4'))}`);

const WEBM = process.env.VIDEO_WEBM === '1';
if (WEBM) {
  run([
    '-i', SRC,
    '-vf', scale,
    '-c:v', 'libvpx-vp9', '-crf', '42', '-b:v', '0',
    '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
    '-pix_fmt', 'yuv420p',
    ...(audio ? ['-c:a', 'libopus', '-b:a', '80k'] : ['-an']),
    join(OUT, 'score-with-jarana.webm'),
  ]);
  console.log(`  webm   ${mb(join(OUT, 'score-with-jarana.webm'))}`);
} else {
  rmSync(join(OUT, 'score-with-jarana.webm'), { force: true });
}

/* Poster. It stands in for the video while it loads and replaces it entirely
   when the visitor has asked for reduced motion, so it is a real image in three
   formats rather than a single still. */
const still = join(OUT, 'poster-source.png');
run(['-ss', POSTER_AT, '-i', SRC, '-frames:v', '1', still]);

const poster = { base: 'assets/video', avif: [], webp: [], fallback: [] };
const meta = await sharp(still).metadata();
poster.width = meta.width;
poster.height = meta.height;

for (const w of [...new Set([480, 720].filter((x) => x < meta.width)), meta.width]) {
  const h = Math.round((meta.height / meta.width) * w);
  const base = () => sharp(still).resize({ width: w, withoutEnlargement: true });
  for (const [kind, name, pipeline] of [
    ['avif', `score-with-jarana-poster-${w}.avif`, base().avif({ quality: 50, effort: 4 })],
    ['webp', `score-with-jarana-poster-${w}.webp`, base().webp({ quality: 74, effort: 5 })],
    ['fallback', `score-with-jarana-poster-${w}.jpg`, base().jpeg({ quality: 80, mozjpeg: true })],
  ]) {
    await pipeline.toFile(join(OUT, name));
    poster[kind].push({ file: name, width: w, height: h });
  }
}
/* A lighter copy for the review file.
 *
 * That file carries the whole site as one document and is refused above a
 * fixed size, and the film is the single heaviest thing in it. It plays there
 * in a contained portrait frame no wider than about 455 points, so half the
 * width costs nothing that can be seen and leaves room for the campaign
 * artwork to stay sharp. It is never served from the built site. */
const REVIEW = join(ROOT, 'src', 'assets', 'video-review');
mkdirSync(REVIEW, { recursive: true });
const reviewFile = join(REVIEW, 'score-with-jarana.mp4');
run([
  '-i', SRC,
  '-vf', 'scale=480:-2',
  '-c:v', 'libx264', '-profile:v', 'main', '-crf', '30', '-preset', 'slow', '-pix_fmt', 'yuv420p',
  ...(audio ? ['-c:a', 'aac', '-b:a', '64k'] : ['-an']),
  '-movflags', '+faststart',
  reviewFile,
]);
console.log(`  review  480 wide  ${mb(reviewFile)}`);

// The extracted still is only an intermediate; the derivatives are what ship.
rmSync(still, { force: true });
console.log(`  poster ${meta.width}x${meta.height} at ${POSTER_AT}s`);

writeFileSync(
  join(ROOT, 'data', 'video.json'),
  JSON.stringify(
    {
      $comment:
        'Written by scripts/optimize-video.mjs. The original is preserved under ' +
        'src/assets/video-sources and is never served.',
      id: 'score-with-jarana',
      source: { width, height, duration: Number(duration.toFixed(2)), hasAudio: Boolean(audio) },
      width: target,
      height: Math.round((height / width) * target / 2) * 2,
      duration: Number(duration.toFixed(2)),
      hasAudio: Boolean(audio),
      sources: [
        ...(WEBM ? [{ file: 'score-with-jarana.webm', type: 'video/webm' }] : []),
        { file: 'score-with-jarana.mp4', type: 'video/mp4' },
      ],
      poster,
    },
    null,
    2
  ) + '\n'
);

console.log('Written: data/video.json');
