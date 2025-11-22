import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  Timestamp,
  onSnapshot,
  addDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  query as queryFirestore // Alias query to avoid naming conflicts
} from 'firebase/firestore';

export interface WatchlistItem {
  animeId: string;
  title: string;
  posterUrl: string;
  addedAt: any;
}

export interface ProgressItem {
  animeId: string;
  title?: string;
  posterUrl?: string;
  lastEpisode: number;
  lastEpisodeId?: string;
  lastTimestamp: number;
  isCompleted: boolean;
  completedEpisodes: number[];
  updatedAt: any;
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  rating: number;
  reviewText: string;
  createdAt: any;
  likes: number;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  text: string;
  timestamp: any;
  likes: number;
  replyTo?: string;
}

export interface Thread {
  id: string;
  title: string;
  body: string;
  userId: string;
  username: string;
  avatarUrl: string;
  createdAt: any;
  upvotes: number;
  downvotes: number;
}

export interface Activity {
  id: string;
  type: 'userStartedAnime' | 'userCompletedAnime' | 'userPostedComment' | 'userPostedReview';
  userId: string;
  username: string;
  avatarUrl: string;
  animeId?: string;
  animeTitle?: string;
  animePoster?: string;
  timestamp: any;
}

export const sanitizeComment = (text: string): string => {
  let sanitized = text;

  // Block URLs except site URLs
  const urlRegex = /(https?:\/\/(?!animebite)[^\s]+)/gi;
  sanitized = sanitized.replace(urlRegex, '[link removed]');

  // Block foul language
  const foulWords = [
    'fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'bastard', 'crap',
    'dick', 'pussy', 'cock', 'nigger', 'nigga', 'fag', 'faggot', 'retard',
    'whore', 'slut', 'cunt'
  ];

  const foulRegex = new RegExp(`\\b(${foulWords.join('|')})\\b`, 'gi');
  sanitized = sanitized.replace(foulRegex, '***');

  // Remove excessive repetition (spam)
  sanitized = sanitized.replace(/(.)\1{4,}/g, '$1$1$1');

  return sanitized.trim();
};

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  avatarUrl: string;
  bannerUrl: string;
  bio?: string;
  parentalPin?: string;
  totalWatchTime?: number;
  lastWatchUpdate?: any;
  isWatchlistPublic?: boolean;
  isContinueWatchingPublic?: boolean;
}

export const addToWatchlist = async (
  userId: string,
  animeId: string,
  title: string,
  posterUrl: string
) => {
  const watchlistRef = doc(db, `users/${userId}/watchlist/${animeId}`);
  await setDoc(watchlistRef, {
    animeId,
    title,
    posterUrl,
    addedAt: serverTimestamp()
  });
};

export const removeFromWatchlist = async (userId: string, animeId: string) => {
  const watchlistRef = doc(db, `users/${userId}/watchlist/${animeId}`);
  await deleteDoc(watchlistRef);
};

export const isInWatchlist = async (userId: string, animeId: string): Promise<boolean> => {
  const watchlistRef = doc(db, `users/${userId}/watchlist/${animeId}`);
  const watchlistDoc = await getDoc(watchlistRef);
  return watchlistDoc.exists();
};

export const getWatchlist = async (userId: string): Promise<WatchlistItem[]> => {
  const watchlistRef = collection(db, `users/${userId}/watchlist`);
  const snapshot = await getDocs(watchlistRef);
  return snapshot.docs.map(doc => doc.data() as WatchlistItem);
};

export const updateProgress = async (
  userId: string,
  animeId: string,
  episodeNumber: number,
  timestamp: number,
  isCompleted: boolean = false,
  animeTitle?: string,
  posterUrl?: string,
  episodeId?: string
) => {
  const progressRef = doc(db, `users/${userId}/progress/${animeId}`);
  const progressDoc = await getDoc(progressRef);

  const completedEpisodes = progressDoc.exists()
    ? (progressDoc.data().completedEpisodes || [])
    : [];

  if (isCompleted && !completedEpisodes.includes(episodeNumber)) {
    completedEpisodes.push(episodeNumber);
  }

  await setDoc(progressRef, {
    animeId,
    title: animeTitle || progressDoc.data()?.title || '',
    posterUrl: posterUrl || progressDoc.data()?.posterUrl || '',
    lastEpisode: episodeNumber,
    lastEpisodeId: episodeId || progressDoc.data()?.lastEpisodeId || '',
    lastTimestamp: timestamp,
    isCompleted,
    completedEpisodes: completedEpisodes.sort((a: number, b: number) => a - b),
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getProgress = async (userId: string, animeId: string): Promise<ProgressItem | null> => {
  const progressRef = doc(db, `users/${userId}/progress/${animeId}`);
  const progressDoc = await getDoc(progressRef);
  return progressDoc.exists() ? progressDoc.data() as ProgressItem : null;
};

export const getContinueWatching = async (userId: string): Promise<ProgressItem[]> => {
  const progressRef = collection(db, `users/${userId}/progress`);
  const q = query(progressRef, orderBy('updatedAt', 'desc'), limit(20));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as ProgressItem);
};

export const addReview = async (
  animeId: string,
  userId: string,
  username: string,
  avatarUrl: string,
  rating: number,
  reviewText: string
) => {
  const reviewRef = collection(db, `anime/${animeId}/reviews`);
  const review = {
    userId,
    username,
    avatarUrl,
    rating,
    reviewText: sanitizeComment(reviewText),
    createdAt: serverTimestamp(),
    likes: 0
  };

  const docRef = await addDoc(reviewRef, review);

  // Add to activity feed
  await addActivity('userPostedReview', userId, username, avatarUrl, animeId);

  return docRef.id;
};

export const getReviews = async (animeId: string): Promise<Review[]> => {
  const reviewsRef = collection(db, `anime/${animeId}/reviews`);
  const q = query(reviewsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
};

export const addComment = async (
  animeId: string,
  episodeId: string,
  userId: string,
  username: string,
  avatarUrl: string,
  text: string,
  replyTo?: string
) => {
  const commentsRef = collection(db, `anime/${animeId}/episodes/${episodeId}/comments`);
  const comment = {
    userId,
    username,
    avatarUrl,
    text: sanitizeComment(text),
    timestamp: serverTimestamp(),
    likes: 0,
    ...(replyTo && { replyTo })
  };

  const docRef = await addDoc(commentsRef, comment);

  // Add to activity feed
  await addActivity('userPostedComment', userId, username, avatarUrl, animeId);

  return docRef.id;
};

export const subscribeToComments = (
  animeId: string,
  episodeId: string,
  callback: (comments: Comment[]) => void
) => {
  const commentsRef = collection(db, `anime/${animeId}/episodes/${episodeId}/comments`);
  const q = query(commentsRef, orderBy('timestamp', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comment));
    callback(comments);
  });
};

export const likeComment = async (animeId: string, episodeId: string, commentId: string) => {
  const commentRef = doc(db, `anime/${animeId}/episodes/${episodeId}/comments/${commentId}`);
  await updateDoc(commentRef, {
    likes: increment(1)
  });
};

export const likeReview = async (animeId: string, reviewId: string) => {
  const reviewRef = doc(db, `anime/${animeId}/reviews/${reviewId}`);
  await updateDoc(reviewRef, {
    likes: increment(1)
  });
};

export const addThread = async (
  animeId: string,
  userId: string,
  username: string,
  avatarUrl: string,
  title: string,
  body: string
) => {
  const threadsRef = collection(db, `anime/${animeId}/threads`);
  const thread = {
    title: sanitizeComment(title),
    body: sanitizeComment(body),
    userId,
    username,
    avatarUrl,
    createdAt: serverTimestamp(),
    upvotes: 0,
    downvotes: 0
  };

  return await addDoc(threadsRef, thread);
};

export const getThreads = async (animeId: string): Promise<Thread[]> => {
  const threadsRef = collection(db, `anime/${animeId}/threads`);
  const q = query(threadsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Thread));
};

export const voteThread = async (
  animeId: string,
  threadId: string,
  userId: string,
  voteType: 'up' | 'down'
) => {
  const voteRef = doc(db, `anime/${animeId}/threads/${threadId}/votes/${userId}`);
  const voteDoc = await getDoc(voteRef);
  const threadRef = doc(db, `anime/${animeId}/threads/${threadId}`);

  if (voteDoc.exists()) {
    const existingVote = voteDoc.data().voteType;

    // If clicking the same vote, remove it
    if (existingVote === voteType) {
      await deleteDoc(voteRef);
      await updateDoc(threadRef, {
        [voteType === 'up' ? 'upvotes' : 'downvotes']: increment(-1)
      });
    } else {
      // Change vote
      await setDoc(voteRef, { voteType, votedAt: serverTimestamp() });
      await updateDoc(threadRef, {
        [voteType === 'up' ? 'upvotes' : 'downvotes']: increment(1),
        [voteType === 'up' ? 'downvotes' : 'upvotes']: increment(-1)
      });
    }
  } else {
    // New vote
    await setDoc(voteRef, { voteType, votedAt: serverTimestamp() });
    await updateDoc(threadRef, {
      [voteType === 'up' ? 'upvotes' : 'downvotes']: increment(1)
    });
  }
};

export const getUserThreadVote = async (
  animeId: string,
  threadId: string,
  userId: string
): Promise<'up' | 'down' | null> => {
  const voteRef = doc(db, `anime/${animeId}/threads/${threadId}/votes/${userId}`);
  const voteDoc = await getDoc(voteRef);
  return voteDoc.exists() ? voteDoc.data().voteType : null;
};

export interface ThreadReply {
  id: string;
  text: string;
  userId: string;
  username: string;
  avatarUrl: string;
  createdAt: any;
}

export const addThreadReply = async (
  animeId: string,
  threadId: string,
  userId: string,
  username: string,
  avatarUrl: string,
  text: string
) => {
  const repliesRef = collection(db, `anime/${animeId}/threads/${threadId}/replies`);
  const reply = {
    text: sanitizeComment(text),
    userId,
    username,
    avatarUrl,
    createdAt: serverTimestamp()
  };

  return await addDoc(repliesRef, reply);
};

export const getThreadReplies = async (
  animeId: string,
  threadId: string
): Promise<ThreadReply[]> => {
  const repliesRef = collection(db, `anime/${animeId}/threads/${threadId}/replies`);
  const q = query(repliesRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ThreadReply));
};

export const addActivity = async (
  type: Activity['type'],
  userId: string,
  username: string,
  avatarUrl: string,
  animeId?: string,
  animeTitle?: string,
  animePoster?: string
) => {
  const activityRef = collection(db, 'activity');
  await addDoc(activityRef, {
    type,
    userId,
    username,
    avatarUrl,
    ...(animeId && { animeId }),
    ...(animeTitle && { animeTitle }),
    ...(animePoster && { animePoster }),
    timestamp: serverTimestamp()
  });
};

export const getActivityFeed = async (limitCount: number = 50): Promise<Activity[]> => {
  const activityRef = collection(db, 'activity');
  const q = query(activityRef, orderBy('timestamp', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
};

export const getRecommendations = async (userId: string, userGenres: string[]): Promise<string[]> => {
  // Simple recommendation based on genre preferences
  // In a real app, you'd use a more sophisticated algorithm
  const recommendationsRef = doc(db, `users/${userId}/recommendations/generated`);
  const recommendationsDoc = await getDoc(recommendationsRef);

  if (recommendationsDoc.exists()) {
    return recommendationsDoc.data().animeIds || [];
  }

  return [];
};

export const saveRecommendations = async (userId: string, animeIds: string[]) => {
  const recommendationsRef = doc(db, `users/${userId}/recommendations/generated`);
  await setDoc(recommendationsRef, {
    animeIds,
    generatedAt: serverTimestamp()
  });
};

export const setParentalPin = async (userId: string, pin: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    parentalPin: pin
  });
};

export const verifyParentalPin = async (userId: string, pin: string): Promise<boolean> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    return userDoc.data().parentalPin === pin;
  }

  return false;
};

// Social Features
export const followUser = async (followerId: string, followingId: string) => {
  const followerRef = doc(db, `users/${followerId}/following/${followingId}`);
  const followingRef = doc(db, `users/${followingId}/followers/${followerId}`);

  await setDoc(followerRef, {
    userId: followingId,
    followedAt: serverTimestamp()
  });

  await setDoc(followingRef, {
    userId: followerId,
    followedAt: serverTimestamp()
  });
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  const followerRef = doc(db, `users/${followerId}/following/${followingId}`);
  const followingRef = doc(db, `users/${followingId}/followers/${followerId}`);

  await deleteDoc(followerRef);
  await deleteDoc(followingRef);
};

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  const followerRef = doc(db, `users/${followerId}/following/${followingId}`);
  const followerDoc = await getDoc(followerRef);
  return followerDoc.exists();
};

export const getFollowers = async (userId: string): Promise<string[]> => {
  const followersRef = collection(db, `users/${userId}/followers`);
  const snapshot = await getDocs(followersRef);
  return snapshot.docs.map(doc => doc.data().userId);
};

export const getFollowing = async (userId: string): Promise<string[]> => {
  const followingRef = collection(db, `users/${userId}/following`);
  const snapshot = await getDocs(followingRef);
  return snapshot.docs.map(doc => doc.data().userId);
};

export const updateWatchTime = async (userId: string, seconds: number) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    totalWatchTime: increment(seconds),
    lastWatchUpdate: serverTimestamp()
  });
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? userDoc.data() : null;
};

export const getUserByUsername = async (username: string) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
};

export const clearUserWatchHistory = async (userId: string) => {
  const progressRef = collection(db, `users/${userId}/progress`);
  const snapshot = await getDocs(progressRef);

  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // Reset total watch time
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    totalWatchTime: 0,
    lastWatchUpdate: serverTimestamp()
  });
};

export const clearUserWatchlist = async (userId: string) => {
  const watchlistRef = collection(db, `users/${userId}/watchlist`);
  const snapshot = await getDocs(watchlistRef);

  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

export const deleteUserAccount = async (userId: string) => {
  // Delete all user subcollections
  const subcollections = ['watchlist', 'progress', 'following', 'followers'];

  for (const subcol of subcollections) {
    const colRef = collection(db, `users/${userId}/${subcol}`);
    const snapshot = await getDocs(colRef);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }

  // Delete user document
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
};

// Mute/Unmute user
export const muteUser = async (userId: string, mutedUserId: string) => {
  const muteRef = doc(db, `users/${userId}/muted/${mutedUserId}`);
  await setDoc(muteRef, {
    userId: mutedUserId,
    mutedAt: serverTimestamp()
  });
};

export const unmuteUser = async (userId: string, mutedUserId: string) => {
  const muteRef = doc(db, `users/${userId}/muted/${mutedUserId}`);
  await deleteDoc(muteRef);
};

export const isMuted = async (userId: string, mutedUserId: string): Promise<boolean> => {
  const muteRef = doc(db, `users/${userId}/muted/${mutedUserId}`);
  const muteDoc = await getDoc(muteRef);
  return muteDoc.exists();
};

export const getMutedUsers = async (userId: string): Promise<string[]> => {
  const mutedRef = collection(db, `users/${userId}/muted`);
  const snapshot = await getDocs(mutedRef);
  return snapshot.docs.map(doc => doc.data().userId);
};

// Block/Unblock user
export const blockUser = async (userId: string, blockedUserId: string) => {
  const blockRef = doc(db, `users/${userId}/blocked/${blockedUserId}`);
  await setDoc(blockRef, {
    userId: blockedUserId,
    blockedAt: serverTimestamp()
  });

  // Unfollow both ways
  await unfollowUser(userId, blockedUserId);
  await unfollowUser(blockedUserId, userId);
};

export const unblockUser = async (userId: string, blockedUserId: string) => {
  const blockRef = doc(db, `users/${userId}/blocked/${blockedUserId}`);
  await deleteDoc(blockRef);
};

export const isBlocked = async (userId: string, blockedUserId: string): Promise<boolean> => {
  const blockRef = doc(db, `users/${userId}/blocked/${blockedUserId}`);
  const blockDoc = await getDoc(blockRef);
  return blockDoc.exists();
};

export const getBlockedUsers = async (userId: string): Promise<string[]> => {
  const blockedRef = collection(db, `users/${userId}/blocked`);
  const snapshot = await getDocs(blockedRef);
  return snapshot.docs.map(doc => doc.data().userId);
};

// Get follower/following details with user info
export const getFollowersWithDetails = async (userId: string) => {
  const followerIds = await getFollowers(userId);
  const followers = [];

  for (const followerId of followerIds) {
    const userProfile = await getUserProfile(followerId);
    if (userProfile) {
      followers.push(userProfile);
    }
  }

  return followers;
};

export const getFollowingWithDetails = async (userId: string) => {
  const followingIds = await getFollowing(userId);
  const following = [];

  for (const followingId of followingIds) {
    const userProfile = await getUserProfile(followingId);
    if (userProfile) {
      following.push(userProfile);
    }
  }

  return following;
};

// Update username in all user's content
export const updateUsernameInContent = async (userId: string, oldUsername: string, newUsername: string, newAvatarUrl: string) => {
  // Update in all anime reviews
  const animesSnapshot = await getDocs(collection(db, 'anime'));

  for (const animeDoc of animesSnapshot.docs) {
    const reviewsRef = collection(db, `anime/${animeDoc.id}/reviews`);
    const reviewsQuery = query(reviewsRef, where('userId', '==', userId));
    const reviewsSnapshot = await getDocs(reviewsQuery);

    for (const reviewDoc of reviewsSnapshot.docs) {
      await updateDoc(reviewDoc.ref, {
        username: newUsername,
        avatarUrl: newAvatarUrl
      });
    }

    // Update in threads
    const threadsRef = collection(db, `anime/${animeDoc.id}/threads`);
    const threadsQuery = query(threadsRef, where('userId', '==', userId));
    const threadsSnapshot = await getDocs(threadsQuery);

    for (const threadDoc of threadsSnapshot.docs) {
      await updateDoc(threadDoc.ref, {
        username: newUsername,
        avatarUrl: newAvatarUrl
      });

      // Update thread replies
      const repliesRef = collection(db, `anime/${animeDoc.id}/threads/${threadDoc.id}/replies`);
      const repliesQuery = query(repliesRef, where('userId', '==', userId));
      const repliesSnapshot = await getDocs(repliesQuery);

      for (const replyDoc of repliesSnapshot.docs) {
        await updateDoc(replyDoc.ref, {
          username: newUsername,
          avatarUrl: newAvatarUrl
        });
      }
    }

    // Update in episodes comments
    const episodesSnapshot = await getDocs(collection(db, `anime/${animeDoc.id}/episodes`));

    for (const episodeDoc of episodesSnapshot.docs) {
      const commentsRef = collection(db, `anime/${animeDoc.id}/episodes/${episodeDoc.id}/comments`);
      const commentsQuery = query(commentsRef, where('userId', '==', userId));
      const commentsSnapshot = await getDocs(commentsQuery);

      for (const commentDoc of commentsSnapshot.docs) {
        await updateDoc(commentDoc.ref, {
          username: newUsername,
          avatarUrl: newAvatarUrl
        });
      }
    }
  }
};



// Forum Types
export interface ForumPost {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  category: string;
  title: string;
  content: string;
  views: number;
  likes: number;
  replies: number;
  likedBy?: string[];
  reactions?: { [emoji: string]: string[] };
  createdAt: Timestamp;
}

export interface ForumReply {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  content: string;
  likes: number;
  likedBy?: string[];
  reactions?: { [emoji: string]: string[] };
  createdAt: Timestamp;
}

// Forum Post Functions
export async function createForumPost(
  userId: string,
  username: string,
  avatarUrl: string,
  category: string,
  title: string,
  content: string
): Promise<string> {
  const postsRef = collection(db, 'forumPosts');
  const postDoc = await addDoc(postsRef, {
    userId,
    username,
    avatarUrl,
    category,
    title,
    content,
    likes: 0,
    reactions: {},
    views: 0,
    replies: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return postDoc.id;
}

export async function getForumPosts(category?: string): Promise<ForumPost[]> {
  const postsRef = collection(db, 'forumPosts');
  let q = query(postsRef, orderBy('createdAt', 'desc'));

  if (category) {
    q = query(postsRef, where('category', '==', category), orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ForumPost));
}

export async function getForumPost(postId: string): Promise<ForumPost | null> {
  const postRef = doc(db, 'forumPosts', postId);
  const postDoc = await getDoc(postRef);

  if (!postDoc.exists()) return null;

  return {
    id: postDoc.id,
    ...postDoc.data()
  } as ForumPost;
}

export async function incrementForumPostViews(postId: string): Promise<void> {
  const postRef = doc(db, 'forumPosts', postId);
  await updateDoc(postRef, {
    views: increment(1)
  });
}

export async function likeForumPost(postId: string, userId: string): Promise<void> {
  const postRef = doc(db, 'forumPosts', postId);
  const postDoc = await getDoc(postRef);

  if (!postDoc.exists()) return;

  const data = postDoc.data();
  const likedBy = data.likedBy || [];

  if (likedBy.includes(userId)) {
    // Unlike - remove user from likedBy array
    await updateDoc(postRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId)
    });
  } else {
    // Like - add user to likedBy array
    await updateDoc(postRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId)
    });
  }
}

export async function reactToForumPost(postId: string, userId: string, emoji: string): Promise<void> {
  const postRef = doc(db, 'forumPosts', postId);
  const postDoc = await getDoc(postRef);

  if (!postDoc.exists()) return;

  const reactions = postDoc.data().reactions || {};
  const emojiReactions = reactions[emoji] || [];

  if (emojiReactions.includes(userId)) {
    // Remove reaction
    reactions[emoji] = emojiReactions.filter((id: string) => id !== userId);
    if (reactions[emoji].length === 0) {
      delete reactions[emoji];
    }
  } else {
    // Add reaction
    reactions[emoji] = [...emojiReactions, userId];
  }

  await updateDoc(postRef, { reactions });
}

export async function addForumReply(
  postId: string,
  userId: string,
  username: string,
  avatarUrl: string,
  content: string
): Promise<void> {
  const repliesRef = collection(db, 'forumPosts', postId, 'replies');
  await addDoc(repliesRef, {
    postId,
    userId,
    username,
    avatarUrl,
    content,
    likes: 0,
    reactions: {},
    createdAt: serverTimestamp()
  });

  const postRef = doc(db, 'forumPosts', postId);
  await updateDoc(postRef, {
    replies: increment(1),
    updatedAt: serverTimestamp()
  });
}

export async function getForumReplies(postId: string): Promise<ForumReply[]> {
  const repliesRef = collection(db, 'forumPosts', postId, 'replies');
  const q = query(repliesRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ForumReply));
}

export async function likeForumReply(postId: string, replyId: string, userId: string): Promise<void> {
  const replyRef = doc(db, 'forumPosts', postId, 'replies', replyId);
  const replyDoc = await getDoc(replyRef);

  if (!replyDoc.exists()) return;

  const data = replyDoc.data();
  const likedBy = data.likedBy || [];

  if (likedBy.includes(userId)) {
    // Unlike - remove user from likedBy array
    await updateDoc(replyRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId)
    });
  } else {
    // Like - add user to likedBy array
    await updateDoc(replyRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId)
    });
  }
}

export async function reactToForumReply(postId: string, replyId: string, userId: string, emoji: string): Promise<void> {
  const replyRef = doc(db, 'forumPosts', postId, 'replies', replyId);
  const replyDoc = await getDoc(replyRef);

  if (!replyDoc.exists()) return;

  const reactions = replyDoc.data().reactions || {};
  const emojiReactions = reactions[emoji] || [];

  if (emojiReactions.includes(userId)) {
    reactions[emoji] = emojiReactions.filter((id: string) => id !== userId);
    if (reactions[emoji].length === 0) {
      delete reactions[emoji];
    }
  } else {
    reactions[emoji] = [...emojiReactions, userId];
  }

  await updateDoc(replyRef, { reactions });
}

export async function searchForumPosts(searchQuery: string): Promise<ForumPost[]> {
  const postsRef = collection(db, 'forumPosts');
  const q = queryFirestore(postsRef, orderBy('createdAt', 'desc'), limit(50));
  const snapshot = await getDocs(q);

  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ForumPost));

  return posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
}

export async function getTrendingForumPosts(limitCount: number = 5): Promise<ForumPost[]> {
  const postsRef = collection(db, 'forumPosts');

  // Get all recent posts (avoiding compound index requirement)
  const q = queryFirestore(
    postsRef,
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ForumPost));

  // Filter for discussions and off-topic only
  const filteredPosts = posts.filter(post => 
    post.category === 'discussions' || post.category === 'off-topic'
  );

  // Sort by engagement score (views + likes*2 + replies*3)
  const sortedPosts = filteredPosts.sort((a, b) => {
    const scoreA = (a.views || 0) + (a.likes || 0) * 2 + (a.replies || 0) * 3;
    const scoreB = (b.views || 0) + (b.likes || 0) * 2 + (b.replies || 0) * 3;
    return scoreB - scoreA;
  });

  return sortedPosts.slice(0, limitCount);
}

// Username validation
export async function isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean> {
  // Check for admin-related usernames
  const lowerUsername = username.toLowerCase();
  if (lowerUsername.includes('admin') || lowerUsername === 'administrator' || lowerUsername === 'moderator') {
    return false;
  }

  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const snapshot = await getDocs(q);

  // If no users found, username is available
  if (snapshot.empty) return true;

  // If editing own profile, allow same username
  if (currentUserId && snapshot.docs[0].id === currentUserId) {
    return true;
  }

  return false;
}