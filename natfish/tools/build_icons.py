#!/usr/bin/env python3
"""The NATFISH icon system.

One family, drawn for this cooperative rather than pulled from a general-purpose
set. Every icon shares a 24px viewBox, a 1.85 stroke, round caps and joins, and
takes its primary colour from `currentColor`. Paths marked `ico__accent` render
in turquoise, and `ico__coral` in coral, so a single element can carry two tones
without a second file.

Nothing loads from a CDN and no icon font is involved: these are inline SVG.

Two groups:

  UTILITY   telephone, email, location, WhatsApp, menu, close, arrows. These stay
            conventional, because a visitor must recognise them instantly.

  FEATURE   lobster, conch, crate, boat, net, seal, catch tag, route, fish. Each
            one is drawn for the specific heading it sits beside, so no symbol is
            reused for two different ideas.
"""

# --------------------------------------------------------------- utility --

UTILITY = {
    "phone": """<path d="M21.4 16.9v2.8a1.9 1.9 0 0 1-2.1 1.9 18.9 18.9 0 0 1-8.2-2.9 18.6 18.6 0 0 1-5.7-5.7A18.9 18.9 0 0 1 2.5 4.7 1.9 1.9 0 0 1 4.4 2.6h2.8a1.9 1.9 0 0 1 1.9 1.6c.12.95.35 1.87.68 2.75a1.9 1.9 0 0 1-.43 2L8.2 10.1a15.2 15.2 0 0 0 5.7 5.7l1.15-1.15a1.9 1.9 0 0 1 2-.43c.88.33 1.8.56 2.75.68a1.9 1.9 0 0 1 1.6 1.95z"/>""",
    "mail": """<rect x="2.6" y="4.8" width="18.8" height="14.4" rx="2"/><path d="m2.6 7.4 8.36 5.2a2 2 0 0 0 2.08 0l8.36-5.2"/>""",
    "pin": """<path d="M19.6 10.2c0 5.6-7.6 11.2-7.6 11.2s-7.6-5.6-7.6-11.2a7.6 7.6 0 0 1 15.2 0z"/><circle cx="12" cy="10" r="2.8"/>""",
    "whatsapp": """<path d="M3.4 20.6 4.7 16.7A8.6 8.6 0 1 1 8 20.1z"/><path d="M9 8.6c.3 0 .5.1.6.4l.7 1.6c.1.2.1.4 0 .5l-.6.8c-.1.2-.1.4 0 .5a8 8 0 0 0 3 3c.2.1.4.1.5 0l.8-.6c.1-.1.3-.2.5-.1l1.6.7c.3.1.4.3.4.6 0 1.1-.9 2-2 2a8 8 0 0 1-7.4-7.4c0-1.1.9-2 2-2z"/>""",
    "close": """<path d="m5.4 5.4 13.2 13.2M18.6 5.4 5.4 18.6"/>""",
    "prev": """<path d="M15 4.8 7.8 12l7.2 7.2"/>""",
    "next": """<path d="m9 4.8 7.2 7.2L9 19.2"/>""",
    "play": """<path d="M8.4 5.1v13.8a.9.9 0 0 0 1.36.77l11.1-6.9a.9.9 0 0 0 0-1.54L9.76 4.34A.9.9 0 0 0 8.4 5.1z" fill="currentColor" stroke="none"/>""",
    "arrow": """<path d="M4.4 12h15.2M13.4 5.8 19.6 12l-6.2 6.2"/>""",
    "external": """<path d="M13.6 4.4h6v6M19.6 4.4 11 13"/><path d="M18.2 14.2v4.4a1.8 1.8 0 0 1-1.8 1.8H5.4a1.8 1.8 0 0 1-1.8-1.8V7.6a1.8 1.8 0 0 1 1.8-1.8h4.4"/>""",
}

# --------------------------------------------------------------- feature --

FEATURE = {
    # Established 1966: a heritage seal, rope ticks on the rim, wave in the core.
    "seal": """<circle cx="12" cy="12" r="8.7"/><circle class="ico__accent" cx="12" cy="12" r="5.5"/><path class="ico__accent" d="M8.9 12.5q1.55-1.45 3.1 0t3.1 0"/><path d="M12 3.3V1.9M12 22.1v-1.4M3.3 12H1.9M22.1 12h-1.4M5.85 5.85 4.86 4.86M19.14 19.14l-.99-.99M18.15 5.85l.99-.99M4.86 19.14l.99-.99"/>""",

    # Fisher-owned cooperative: a skiff carrying two members.
    "boat": """<path d="M3.5 16.9h17l-2 3.3a2 2 0 0 1-1.7 1H7.2a2 2 0 0 1-1.7-1z"/><circle cx="9.4" cy="7.6" r="1.7"/><circle cx="15.3" cy="9.3" r="1.5"/><path d="M6.9 14.6c0-2 1.1-3.6 2.5-3.6s2.5 1.6 2.5 3.6M13.2 14.6c0-1.8.94-3.1 2.1-3.1s2.1 1.3 2.1 3.1"/><path class="ico__accent" d="M2 14.2h20"/>""",

    # Belize City: a marker standing on the coast.
    "coast": """<path d="M12 2.6a4.9 4.9 0 0 0-4.9 4.9c0 3.5 4.9 8 4.9 8s4.9-4.5 4.9-8A4.9 4.9 0 0 0 12 2.6z"/><circle cx="12" cy="7.4" r="1.8"/><path class="ico__accent" d="M2.4 19.4q2.4-1.8 4.8 0t4.8 0t4.8 0t4.8 0"/>""",

    # Caribbean spiny lobster from above. Built from filled forms rather than
    # a single outline: an oval carapace, three tapering abdomen bands and the
    # spread tail fan, with antennae and legs left as strokes so it still sits
    # in the family. Outline versions read as a beetle (symmetrical body, two
    # dots on top) or a megaphone (side profile with the fan on the right); the
    # segmented silhouette is what actually says crustacean.
    "lobster": """<ellipse cx="12" cy="9.1" rx="3.5" ry="2.9" fill="currentColor" stroke="none"/><path d="M8.9 12.1h6.2l-.5 2.4H9.4z" fill="currentColor" stroke="none"/><path d="M9.5 14.9h5l-.45 2.3H9.95z" fill="currentColor" stroke="none"/><path d="M10.05 17.6h3.9l-.4 2.2h-3.1z" fill="currentColor" stroke="none"/><path d="M12 19.5 9.1 22.5h5.8z" fill="currentColor" stroke="none"/><path d="M10.2 6.6 6.4 2.3M13.8 6.6 17.6 2.3"/><path d="M8.5 8.1 5.1 7.1M8.4 10.5 5 10.9M15.5 8.1l3.4-1M15.6 10.5l3.4.4"/>""",

    # Queen conch: body whorl, inner spiral, shoulder spikes.
    "conch": """<path d="M5.7 16.4c0-4.7 3.6-8.8 7.7-8.8 2.7 0 4.7 2 4.7 4.6 0 4.7-5.1 7.7-9.4 8.6-2 .4-3-.4-3-1.9z"/><path class="ico__accent" d="M13.3 10.4c1.1.5 1.8 1.4 1.8 2.5 0 1.8-1.5 3.1-3.1 3.8"/><path d="M8.4 9.5 7.3 6.5M11.6 7.7 12 4.6M14.7 8.5l1.9-2.5"/>""",

    # Other seafood: a fish above a market crate.
    "crate-fish": """<path d="M3.4 11.2h17.2v7.6a1.7 1.7 0 0 1-1.7 1.7H5.1a1.7 1.7 0 0 1-1.7-1.7z"/><path d="M3.4 15h17.2M9.1 11.2v9.3M14.9 11.2v9.3"/><path class="ico__accent" d="M6.3 6.4c1.7-2.3 5.2-2.3 6.9 0-1.7 2.3-5.2 2.3-6.9 0z"/><path class="ico__accent" d="m13.2 6.4 2.7-1.8v3.6z"/>""",

    # Fisher support: a member working a net from the skiff.
    "net": """<path d="M3.6 17.2h16.8l-1.9 3.1a1.9 1.9 0 0 1-1.6.9H7.1a1.9 1.9 0 0 1-1.6-.9z"/><circle cx="7.6" cy="5.9" r="1.7"/><path d="M4.9 13.4c0-2.3 1.2-4.1 2.7-4.1s2.7 1.8 2.7 4.1"/><path class="ico__accent" d="M12.6 7.9h8.2v6.2h-8.2zM12.6 11h8.2M16.7 7.9v6.2M12.6 7.9l8.2 6.2M20.8 7.9l-8.2 6.2"/>""",

    # Careful handling: a packed crate that has been checked.
    "handling": """<path d="M2.8 11.4h11.6v7.6a1.7 1.7 0 0 1-1.7 1.7H4.5a1.7 1.7 0 0 1-1.7-1.7z"/><path d="M2.8 15.1h11.6M8.6 11.4v9.3"/><circle class="ico__accent" cx="17.4" cy="7.2" r="4.4"/><path class="ico__accent" d="m15.5 7.3 1.5 1.5 2.6-2.9"/>""",

    # Traceability: a catch-documentation tag, not a QR grid.
    "tag": """<path d="M11.9 3.2h6.9a2 2 0 0 1 2 2v6.9l-9 9a1.9 1.9 0 0 1-2.7 0L3.4 15.4a1.9 1.9 0 0 1 0-2.7z"/><circle cx="16.6" cy="7.4" r="1.6"/><path class="ico__accent" d="M3.2 21.6h.01M6.6 21.6h.01M10 21.6h.01M13.4 21.6h.01" stroke-width="2.6"/>""",

    # Market connection: product routed to a destination.
    "route": """<path d="M2.6 12.6h8v6.3a1.6 1.6 0 0 1-1.6 1.6H4.2a1.6 1.6 0 0 1-1.6-1.6z"/><path d="M2.6 15.9h8M6.6 12.6v8"/><path class="ico__accent" d="M12.4 16.4c3.4 0 5-2.3 5-5.2"/><path class="ico__accent" d="m15.2 14.6-2.8 1.8 2 2.5"/><path d="M17.4 2.6a3.6 3.6 0 0 0-3.6 3.6c0 2.6 3.6 5.8 3.6 5.8s3.6-3.2 3.6-5.8a3.6 3.6 0 0 0-3.6-3.6z"/>""",

    # Responsible fisheries: the fish, the water and the growth it depends on.
    "steward": """<path d="M2.4 13.9c2.4-2.9 5.4-4.4 7.8-4.4s5 1.5 6.6 4.4c-1.6 2.9-4.2 4.4-6.6 4.4s-5.4-1.5-7.8-4.4z"/><circle cx="6.9" cy="13" r=".95"/><path d="m16.8 13.9 3.5-2.4v4.8z"/><path class="ico__accent" d="M14.6 7.4c0-2.4 2-4.4 4.6-4.4 0 2.4-2 4.4-4.6 4.4z"/><path class="ico__accent" d="M2.4 21.2q2.4-1.7 4.8 0t4.8 0t4.8 0t4.8 0"/>""",

    # What's New: a printed notice carrying the coast.
    "news": """<path d="M3.4 6a1.8 1.8 0 0 1 1.8-1.8h11.4A1.8 1.8 0 0 1 18.4 6v11.8a2 2 0 0 0 2 2H5.4a2 2 0 0 1-2-2z"/><path d="M6.4 8.2h8M6.4 11.2h8"/><path class="ico__accent" d="M6.4 14.9q1.95-1.5 3.9 0t3.9 0"/>""",

    # Gallery: a framed view of a working harbour.
    "gallery": """<rect x="3.2" y="4.6" width="17.6" height="14.8" rx="2"/><path d="M9.6 11.6h5.2l-1 2h-3.2z"/><path d="M12.2 11.6V8.4"/><path class="ico__accent" d="M6 15.9q2-1.5 4 0t4 0t4 0"/>""",
}

ICONS = {**UTILITY, **FEATURE}


def icon(name, css=""):
    """Inline SVG. Decorative by default, since these sit beside visible text."""
    cls = "ico" + (f" {css}" if css else "")
    return (
        f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        f'stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" '
        f'aria-hidden="true" focusable="false">{ICONS[name]}</svg>'
    )
