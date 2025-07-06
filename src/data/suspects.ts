import { Suspect } from '@/types/game';

export const suspects: Record<string, Suspect> = {
  elena: {
    id: 'elena',
    name: 'Elena Vasquez',
    emoji: '🎭',
    title: 'Theater Director',
    bio: 'Theater Director (Age 47). Successful off-Broadway director recently chosen to helm a major Broadway production. Elena and Marcus were close friends in college, both involved in dramatic arts. She appears confident and charismatic but has been unusually quiet tonight.',
    chatLog: []
  },
  david: {
    id: 'david',
    name: 'David Chen',
    emoji: '💻',
    title: 'Software Engineer',
    bio: 'Software Engineer (Age 46). Senior engineer at a major tech company. The quiet, analytical type who keeps detailed mental notes about everything. David was Marcus\'s college roommate and closest friend. He seems genuinely shocked by the death.',
    chatLog: []
  },
  sarah: {
    id: 'sarah',
    name: 'Sarah Mitchell',
    emoji: '⚖️',
    title: 'Corporate Lawyer',
    bio: 'Corporate Lawyer (Age 47). High-powered attorney at a prestigious firm. Known for her sharp tongue and competitive nature. She and Marcus had a complicated romantic history in college. She\'s been drinking heavily tonight.',
    chatLog: []
  },
  james: {
    id: 'james',
    name: 'Professor James Wright',
    emoji: '📚',
    title: 'English Literature Professor',
    bio: 'English Literature Professor (Age 48). Academic who never left the college town. Organized this reunion and chose the venue. He appears nervous and keeps checking his watch. Was Marcus\'s academic rival in college.',
    chatLog: []
  },
  rebecca: {
    id: 'rebecca',
    name: 'Dr. Rebecca Torres',
    emoji: '🏥',
    title: 'Emergency Room Physician',
    bio: 'Emergency Room Physician (Age 46). Trauma surgeon who works intense hours. She\'s been the group\'s unofficial therapist, always helping others with their problems. She discovered the body and immediately called 911.',
    chatLog: []
  }
};