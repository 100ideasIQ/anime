import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useProgress } from "@/hooks/useProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useParams } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pencil,
  LogOut,
  Users,
  UserPlus,
  UserMinus,
  Clock,
  Film,
  Settings,
  Trash2,
  History,
  UserX,
  Volume2,
  VolumeX,
  Ban,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowers,
  getFollowing,
  getUserProfile,
  getUserByUsername,
  clearUserWatchHistory,
  clearUserWatchlist,
  deleteUserAccount,
  getFollowersWithDetails,
  getFollowingWithDetails,
  muteUser,
  unmuteUser,
  isMuted,
  blockUser,
  unblockUser,
  isBlocked,
} from "@/lib/firestore-utils";
import { formatDistanceToNow } from "date-fns";

const avatarImages = [
  "/img1.jpg",
  "/img2.png",
  "/img3.jpg",
  "/img6.jpg",
  "/img7.jpg",
  "/img8.jpg",
  "/img9.png",
  "/img10.png",
  "/img11.jpg",
  "/img12.jpg",
  "/img13.png",
  "/img14.jpg",
  "/img15.jpg",
  "/img16.jpg",
  "/img17.jpg",
  "/img18.jpg",
  "/img19.jpg",
  "/img20.jpg",
];

const bannerImages = [
  "/b1.jpg",
  "/b2.jpg",
  "/b3.jpg",
  "/b4.jpg",
  "/b5.jpg",
  "/b6.png",
  "/b7.png",
];

export default function Profile() {
  const { currentUser, userProfile, logout, updateUserProfile } = useAuth();
  const { watchlist, loading: watchlistLoading } = useWatchlist();
  const { continueWatching, loading: progressLoading } = useProgress();
  const [, setLocation] = useLocation();
  const params = useParams();

  const [editing, setEditing] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
  });

  const [viewingProfile, setViewingProfile] = useState<any>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [followersWithDetails, setFollowersWithDetails] = useState<any[]>([]);
  const [followingWithDetails, setFollowingWithDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  const usernameParam = params?.username;
  const isOwnProfile =
    !usernameParam || usernameParam === userProfile?.username;

  useEffect(() => {
    if (!currentUser) {
      setLocation("/auth/login");
    }
  }, [currentUser, setLocation]);

  useEffect(() => {
    loadProfile();
  }, [usernameParam, currentUser, userProfile]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      let profile;

      if (isOwnProfile) {
        profile = userProfile;
      } else if (usernameParam) {
        profile = await getUserByUsername(usernameParam);
      }

      if (!profile) {
        setLoading(false);
        return;
      }

      // Check if blocked
      if (currentUser && !isOwnProfile && profile.uid) {
        const blocked = await isBlocked(currentUser.uid, profile.uid);
        if (blocked) {
          setLoading(false);
          return;
        }
      }

      setViewingProfile(profile);

      const followersList = await getFollowers(profile.uid);
      const followingList = await getFollowing(profile.uid);
      setFollowers(followersList);
      setFollowing(followingList);

      if (currentUser && !isOwnProfile && profile.uid) {
        const following = await isFollowing(currentUser.uid, profile.uid);
        setIsFollowingUser(following);
      }

      if (isOwnProfile && userProfile) {
        setFormData({
          username: userProfile.username,
          bio: userProfile.bio || "",
        });

        // Load muted and blocked users
        const { getMutedUsers, getBlockedUsers } = await import(
          "@/lib/firestore-utils"
        );
        const muted = await getMutedUsers(currentUser.uid);
        const blocked = await getBlockedUsers(currentUser.uid);
        setMutedUsers(muted);
        setBlockedUsers(blocked);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowingDetails = async () => {
    if (!viewingProfile?.uid) return;
    const details = await getFollowingWithDetails(viewingProfile.uid);
    setFollowingWithDetails(details);
  };

  const loadFollowersDetails = async () => {
    if (!viewingProfile?.uid) return;
    const details = await getFollowersWithDetails(viewingProfile.uid);
    setFollowersWithDetails(details);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleAvatarSelect = async (avatar: string) => {
    if (!currentUser || !userProfile) return;
    try {
      await updateUserProfile({ avatarUrl: avatar });
      setAvatarDialogOpen(false);
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  const handleBannerSelect = async (banner: string) => {
    if (!currentUser || !userProfile) return;
    try {
      await updateUserProfile({ bannerUrl: banner });
      setBannerDialogOpen(false);
    } catch (error) {
      console.error("Error updating banner:", error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !viewingProfile?.uid || isOwnProfile) return;

    try {
      if (isFollowingUser) {
        await unfollowUser(currentUser.uid, viewingProfile.uid);
        setIsFollowingUser(false);
        setFollowers((prev) => prev.filter((id) => id !== currentUser.uid));
      } else {
        await followUser(currentUser.uid, viewingProfile.uid);
        setIsFollowingUser(true);
        setFollowers((prev) => [...prev, currentUser.uid]);
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };

  const handleMuteToggle = async (userId: string) => {
    if (!currentUser) return;
    try {
      const muted = mutedUsers.includes(userId);
      if (muted) {
        await unmuteUser(currentUser.uid, userId);
        setMutedUsers((prev) => prev.filter((id) => id !== userId));
      } else {
        await muteUser(currentUser.uid, userId);
        setMutedUsers((prev) => [...prev, userId]);
      }
    } catch (error) {
      console.error("Error muting/unmuting user:", error);
    }
  };

  const handleBlock = async (userId: string) => {
    if (!currentUser) return;
    try {
      await blockUser(currentUser.uid, userId);
      setBlockedUsers((prev) => [...prev, userId]);
      // Reload following list to remove blocked user
      await loadFollowingDetails();
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const handleUnblock = async (userId: string) => {
    if (!currentUser) return;
    try {
      await unblockUser(currentUser.uid, userId);
      setBlockedUsers((prev) => prev.filter((id) => id !== userId));
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  const handleClearWatchHistory = async () => {
    if (!currentUser) return;
    try {
      await clearUserWatchHistory(currentUser.uid);
      alert("Watch history cleared successfully");
    } catch (error) {
      console.error("Error clearing watch history:", error);
    }
  };

  const handleClearWatchlist = async () => {
    if (!currentUser) return;
    try {
      await clearUserWatchlist(currentUser.uid);
      alert("Watchlist cleared successfully");
    } catch (error) {
      console.error("Error clearing watchlist:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    try {
      await deleteUserAccount(currentUser.uid);
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const formatWatchTime = (seconds: number = 0) => {
    if (!seconds || seconds < 0) return "0m";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div>Loading profile...</div>
      </div>
    );
  }

  const profile = isOwnProfile ? userProfile : viewingProfile;
  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div>Profile not found or blocked</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Banner Section */}
      <div
        className="relative h-48 md:h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${profile.bannerUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />
        {isOwnProfile && (
          <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full h-10 w-10 md:h-12 md:w-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Choose Banner Image</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {bannerImages.map((img) => (
                  <button
                    key={img}
                    onClick={() => handleBannerSelect(img)}
                    className={`rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      profile.bannerUrl === img
                        ? "border-primary ring-2 ring-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt="Banner"
                      className="w-full aspect-[3/1] object-cover"
                    />
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4 -mt-16 md:-mt-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          {/* Avatar */}
          <div className="relative group w-28 h-28 md:w-32 md:h-32 flex-shrink-0">
            <Avatar className="w-full h-full border-4 border-background ring-2 ring-primary/20">
              <AvatarImage src={profile.avatarUrl} />
              <AvatarFallback className="text-3xl">
                {profile.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <Dialog
                open={avatarDialogOpen}
                onOpenChange={setAvatarDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full h-10 w-10 md:h-12 md:w-12 bg-black/70 hover:bg-black/90 backdrop-blur-sm border border-white/30 shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 md:h-6 md:w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Choose Profile Picture</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-4 md:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
                    {avatarImages.map((img) => (
                      <button
                        key={img}
                        onClick={() => handleAvatarSelect(img)}
                        className={`rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                          profile.avatarUrl === img
                            ? "border-primary ring-2 ring-primary"
                            : "border-transparent"
                        }`}
                      >
                        <img
                          src={img}
                          alt="Avatar"
                          className="w-full aspect-square object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {profile.username}
                </h1>
                {isOwnProfile && (
                  <p className="text-muted-foreground mt-1">{profile.email}</p>
                )}
                {profile.bio && (
                  <p className="text-sm mt-2 max-w-2xl">{profile.bio}</p>
                )}
              </div>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setEditing(!editing)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      {editing ? "Cancel" : "Edit Profile"}
                    </Button>
                    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Account Settings</DialogTitle>
                          <DialogDescription>
                            Manage your account settings and preferences
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-3 pb-4 border-b border-border">
                            <h3 className="text-sm font-semibold">
                              Privacy Settings
                            </h3>
                            <label className="flex items-center justify-between cursor-pointer">
                              <span className="text-sm text-muted-foreground">
                                Public Watchlist
                              </span>
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={
                                    userProfile?.isWatchlistPublic ?? true
                                  }
                                  onChange={async (e) => {
                                    await updateUserProfile({
                                      isWatchlistPublic: e.target.checked,
                                    });
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-purple-700 transition-all duration-300"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow-lg"></div>
                              </div>
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                              <span className="text-sm text-muted-foreground">
                                Public Continue Watching
                              </span>
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={
                                    userProfile?.isContinueWatchingPublic ??
                                    true
                                  }
                                  onChange={async (e) => {
                                    await updateUserProfile({
                                      isContinueWatchingPublic:
                                        e.target.checked,
                                    });
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-purple-700 transition-all duration-300"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow-lg"></div>
                              </div>
                            </label>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleLogout}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleClearWatchHistory}
                          >
                            <History className="mr-2 h-4 w-4" />
                            Clear Watch History
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleClearWatchlist}
                          >
                            <Film className="mr-2 h-4 w-4" />
                            Clear Watchlist
                          </Button>
                          <Button
                            variant="destructive"
                            className="w-full justify-start"
                            onClick={() => {
                              setSettingsOpen(false);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={deleteConfirmOpen}
                      onOpenChange={setDeleteConfirmOpen}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Account</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete your account? This
                            action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                          >
                            Delete Account
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <Button
                    onClick={handleFollow}
                    variant={isFollowingUser ? "outline" : "default"}
                  >
                    {isFollowingUser ? (
                      <>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <Card
            className="cursor-pointer hover:bg-accent/50"
            onClick={() => {
              loadFollowersDetails();
              setFollowersDialogOpen(true);
            }}
          >
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{followers.length}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:bg-accent/50"
            onClick={() => {
              loadFollowingDetails();
              setFollowingDialogOpen(true);
            }}
          >
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{following.length}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Film className="h-5 w-5 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{watchlist.length}</div>
              <div className="text-xs text-muted-foreground">Watchlist</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Film className="h-5 w-5 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {continueWatching.length}
              </div>
              <div className="text-xs text-muted-foreground">Watching</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {formatWatchTime(profile.totalWatchTime)}
              </div>
              <div className="text-xs text-muted-foreground">Watch Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Following Dialog */}
        <Dialog
          open={followingDialogOpen}
          onOpenChange={setFollowingDialogOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Following ({followingWithDetails.length})
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {followingWithDetails.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent"
                >
                  <Avatar
                    className="h-10 w-10 cursor-pointer"
                    onClick={() => {
                      setFollowingDialogOpen(false);
                      setLocation(`/profile/${user.username}`);
                    }}
                  >
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>
                      {user.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      setFollowingDialogOpen(false);
                      setLocation(`/profile/${user.username}`);
                    }}
                  >
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  {isOwnProfile && currentUser && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMuteToggle(user.uid)}
                        title={
                          mutedUsers.includes(user.uid) ? "Unmute" : "Mute"
                        }
                      >
                        {mutedUsers.includes(user.uid) ? (
                          <Volume2 className="h-4 w-4" />
                        ) : (
                          <VolumeX className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBlock(user.uid)}
                        title="Block"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {followingWithDetails.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Not following anyone yet
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Followers Dialog */}
        <Dialog
          open={followersDialogOpen}
          onOpenChange={setFollowersDialogOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Followers ({followersWithDetails.length})
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {followersWithDetails.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent"
                >
                  <Avatar
                    className="h-10 w-10 cursor-pointer"
                    onClick={() => {
                      setFollowersDialogOpen(false);
                      setLocation(`/profile/${user.username}`);
                    }}
                  >
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>
                      {user.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      setFollowersDialogOpen(false);
                      setLocation(`/profile/${user.username}`);
                    }}
                  >
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  {isOwnProfile && currentUser && (
                    <Button
                      size="sm"
                      variant={
                        following.includes(user.uid) ? "outline" : "default"
                      }
                      onClick={async () => {
                        if (following.includes(user.uid)) {
                          await unfollowUser(currentUser.uid, user.uid);
                          setFollowing((prev) =>
                            prev.filter((id) => id !== user.uid),
                          );
                        } else {
                          await followUser(currentUser.uid, user.uid);
                          setFollowing((prev) => [...prev, user.uid]);
                        }
                      }}
                    >
                      {following.includes(user.uid)
                        ? "Following"
                        : "Follow Back"}
                    </Button>
                  )}
                </div>
              ))}
              {followersWithDetails.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No followers yet
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Form */}
        {editing && isOwnProfile && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>
        )}

        {/* Tabs Section */}
        <Tabs defaultValue="watchlist" className="mt-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="watchlist">
              Watchlist ({watchlist.length})
            </TabsTrigger>
            <TabsTrigger value="continue">
              Continue Watching ({continueWatching.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist" className="mt-6">
            {!isOwnProfile && !(viewingProfile?.isWatchlistPublic ?? true) ? (
              <div className="text-center py-12 text-muted-foreground">
                <Film className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>This watchlist is private</p>
              </div>
            ) : watchlistLoading ? (
              <div className="text-center py-12">Loading watchlist...</div>
            ) : watchlist.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Film className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Watchlist is empty</p>
                {isOwnProfile && (
                  <p className="text-sm mt-2">Start adding anime!</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {watchlist.map((item) => (
                  <div
                    key={item.animeId}
                    className="group cursor-pointer"
                    onClick={() => setLocation(`/anime/${item.animeId}`)}
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="continue" className="mt-6">
            {!isOwnProfile &&
            !(viewingProfile?.isContinueWatchingPublic ?? true) ? (
              <div className="text-center py-12 text-muted-foreground">
                <Film className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Continue watching is private</p>
              </div>
            ) : progressLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : continueWatching.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Film className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No anime in progress</p>
                {isOwnProfile && (
                  <p className="text-sm mt-2">Start watching!</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {continueWatching.map((item) => (
                  <div
                    key={item.animeId}
                    className="group cursor-pointer"
                    onClick={() =>
                      setLocation(
                        `/watch/${item.animeId}?ep=${item.lastEpisode}`,
                      )
                    }
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                      {item.posterUrl ? (
                        <img
                          src={item.posterUrl}
                          alt={item.title || item.animeId}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-accent flex items-center justify-center">
                          <Film className="h-12 w-12 opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                        <p className="text-xs text-white">
                          Episode {item.lastEpisode}
                        </p>
                        <div className="w-full bg-white/30 h-1 rounded-full mt-1">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: "30%" }}
                          />
                        </div>
                      </div>
                    </div>
                    <h3 className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title || item.animeId}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
