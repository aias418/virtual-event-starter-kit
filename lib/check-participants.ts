import { MinimumTalk, Talk } from '@lib/types';

export function isCurrentUserParticipating(participants: any, currentUserEmail: string) {
  const foundRecord = participants.find((participant: any) => participant.email == currentUserEmail);
  return !!foundRecord;
}

/* isJoinable check utility functions */
export function isTimeslotAvailable(myTalks: Talk[], currentTalk: Talk){
  for (const talk of myTalks) {
    if (talk.start === currentTalk.start) return false;
  }
  return true;
}

export function abracademyConditionCheck(myTalks: Talk[], currentTalk: Talk) {
  if (currentTalk.slug.includes('abracademy-workshop') === false) return true;
  for (const talk of myTalks) {
    if (talk.slug.includes('abracademy-workshop')) return false;
  }
  return true;
}



/* isJoinable check utility functions */
export function isMineTimeslotAvailable(myTalks: MinimumTalk[], currentTalk: Talk){
  for (const talk of myTalks) {
    if (talk.start === currentTalk.start) return false;
  }
  return true;
}

export function mineAbracademyConditionCheck(myTalks: MinimumTalk[], currentTalk: Talk) {
  if (currentTalk.slug.includes('abracademy-workshop') === false) return true;
  for (const talk of myTalks) {
    if (talk.slug.includes('abracademy-workshop')) return false;
  }
  return true;
}
