/**
 * Leadership team (placeholder).
 * TODO (client): replace names, roles, bios and add real headshots.
 */
export type TeamMember = {
  name: string;
  role: string;
  bio: string;
};

export const team: TeamMember[] = [
  {
    name: 'R. Duke',
    role: 'Founder & Managing Director',
    bio: 'Grew up on the water and built Duke Marine into Belize’s go-to marine store — still on the floor most mornings talking rigging, tackle and dive gear.',
  },
  {
    name: 'M. Castillo',
    role: 'Operations & Commercial Sales',
    bio: 'Leads wholesale and fleet accounts, keeping resorts, guides and co-ops supplied and on schedule.',
  },
  {
    name: 'R. Nunez',
    role: 'Marine Service Manager',
    bio: 'Runs the rigging and outboard service bench — every engine and prop is set up and tested before it leaves the shop.',
  },
  {
    name: 'T. Flores',
    role: 'Fishing Department Lead',
    bio: 'A lifelong angler who tests the tackle we sell and helps customers match gear to Belize’s flats, reef and blue water.',
  },
];
