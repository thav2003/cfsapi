// export interface User {
//   id: string;
//   age: number;
//   gender: 'male' | 'female';
//   location: {
//     long: number;
//     lat: number;
//   };
//   interests: string[];
//   lastSeen: Date;
// }

import { User } from '@models';

  
export interface SearchResult {
  user: User;
  score: number;
}

export interface ITinderAlgorithm {
  findMatches(currentUser: User, allUsers: User[], limit: number, gender?: 'male' | 'female'): User[];
}

export class TinderAlgorithm {
  findMatches(currentUser: User, allUsers: User[], limit: number = 10, gender?: 'male' | 'female'): User[] {
    const currentTime = new Date();
    
    const searchResults: SearchResult[] = [];
    
    // Calculate scores for each user in the list
    for (const user of allUsers) {
      if (this.canDisplayUser(user, currentTime)) {
        const score = this.calculateScore(currentUser, user, gender);
        searchResults.push({ user, score });
      }
    }
    
    // Sort the results by score in descending order, but only include users who have not been seen within the specified time
    const filteredResults = searchResults.filter(result => this.canDisplayUser(result.user, currentTime));
    filteredResults.sort((a, b) => b.score - a.score);
    
    // Return the top n users
    return filteredResults.slice(0, limit).map(result => result.user);
  }
    
  private canDisplayUser(user: User, currentTime: Date): boolean {
    const timeDiff = currentTime.getTime() - user.lastSeen.getTime();
    const timeDiffInHours = timeDiff / (1000 * 60 * 60);
    
    return timeDiffInHours >= 24;
  }
  
  private calculateScore(currentUser: User, otherUser: User, gender?: 'male' | 'female'): number {
    let score = 0;

    // Age similarity score
    const ageDiff = Math.abs(currentUser.age - otherUser.age);
    const ageScore = 1 - (ageDiff / 100);
    score += ageScore;

    // Gender similarity score
    const otherUserGender = gender || otherUser.gender;
    if (currentUser.gender !== otherUserGender) {
      score -= 0.5;
    }

    // Location similarity score
    const locationDiff = this.calculateLocationDiff(currentUser.location, otherUser.location);
    const locationScore = 1 - (locationDiff / 100);
    score += locationScore;

    // Interest similarity score
    const commonInterests = currentUser.interests.filter(i => otherUser.interests.includes(i));
    const interestScore = commonInterests.length / currentUser.interests.length;
    score += interestScore;

    return score;
  }

  
  private calculateLocationDiff(location1: { long: number, lat: number }, location2: { long: number, lat: number }): number {
    const earthRadius = 6371; // in km
    const lat1 = this.toRadians(location1.lat);
    const lat2 = this.toRadians(location2.lat);
    const latDiff = this.toRadians(location2.lat - location1.lat);
    const longDiff = this.toRadians(location2.long - location1.long);
    const a = Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(longDiff / 2) * Math.sin(longDiff / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
    return distance;
  }
  
  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
}