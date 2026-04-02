import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection, addDoc, getDocs, query, orderBy,
  updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp
} from "firebase/firestore";
import {
  ref, uploadBytesResumable, getDownloadURL
} from "firebase/storage";
import { auth, db, storage } from "./Firebase";
import PageContainer from "./layout/PageContainer";
import {
  Heart, MessageCircle, Image, Video, Send, X, Loader2,
  Users, Sparkles, Upload, Play, Star
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return "";
  const seconds = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ── Media Upload Hook ─────────────────────────────────────────────────────────
function useMediaUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const upload = (file) =>
    new Promise((resolve, reject) => {
      const ext = file.name.split(".").pop();
      const storageRef = ref(storage, `community/${Date.now()}.${ext}`);
      const task = uploadBytesResumable(storageRef, file);
      setUploading(true);
      task.on(
        "state_changed",
        (snap) => setProgress((snap.bytesTransferred / snap.totalBytes) * 100),
        (err) => { setUploading(false); reject(err); },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          setUploading(false);
          setProgress(0);
          resolve(url);
        }
      );
    });

  return { upload, progress, uploading };
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onLike, onComment }) {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const liked = currentUser && post.likes?.includes(currentUser.uid);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    setSubmitting(true);
    await onComment(post.id, {
      text: commentText.trim(),
      author: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
      uid: currentUser.uid,
      createdAt: new Date().toISOString(),
    });
    setCommentText("");
    setSubmitting(false);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel border border-(--border-light) flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-(--primary) to-(--secondary) flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {(post.authorName?.[0] || "U").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-(--text) text-sm truncate">{post.authorName || "User"}</p>
          <p className="text-xs text-(--text-secondary)">{timeAgo(post.createdAt)}</p>
        </div>
        {post.type === "review" && (
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <Star size={12} fill="currentColor" />
            <span>{post.rating}/5</span>
          </div>
        )}
        <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-(--bg-alt) text-(--text-secondary)">
          {post.type}
        </span>
      </div>

      {/* Body Text */}
      {post.text && (
        <p className="text-(--text) leading-relaxed text-sm">{post.text}</p>
      )}

      {/* Media */}
      {post.mediaUrl && post.mediaType === "image" && (
        <div className="rounded-2xl overflow-hidden aspect-video bg-(--bg-alt)">
          <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
        </div>
      )}
      {post.mediaUrl && post.mediaType === "video" && (
        <div className="rounded-2xl overflow-hidden aspect-video bg-(--bg-alt) relative">
          <video src={post.mediaUrl} controls className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 p-1.5 rounded-lg glass-panel">
            <Play size={12} className="text-white" />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-(--border-light)">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => currentUser && onLike(post.id, liked)}
          className={`flex items-center gap-2 text-sm font-semibold transition-colors ${liked ? "text-rose-500" : "text-(--text-secondary) hover:text-rose-500"}`}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
          <span>{post.likes?.length || 0}</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-sm font-semibold text-(--text-secondary) hover:text-(--primary) transition-colors"
        >
          <MessageCircle size={16} />
          <span>{post.comments?.length || 0}</span>
        </motion.button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            {/* Existing Comments */}
            {post.comments?.length > 0 && (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {post.comments.map((c, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="w-7 h-7 rounded-lg bg-(--bg-alt) border border-(--border) flex items-center justify-center text-xs font-bold text-(--text-secondary) flex-shrink-0">
                      {(c.author?.[0] || "U").toUpperCase()}
                    </div>
                    <div className="bg-(--bg-alt) rounded-xl px-3 py-2 flex-1 min-w-0">
                      <p className="text-xs font-bold text-(--primary) mb-0.5">{c.author}</p>
                      <p className="text-xs text-(--text)">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            {currentUser ? (
              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment…"
                  className="flex-1 bg-(--bg-alt) border border-(--border) rounded-xl px-3 py-2 text-sm text-(--text) placeholder:text-(--text-secondary) focus:outline-none focus:border-(--primary)"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="w-10 h-10 rounded-xl bg-(--primary) text-white flex items-center justify-center disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </motion.button>
              </form>
            ) : (
              <p className="text-xs text-(--text-secondary) italic">Login to comment.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// ── Create Post Modal ─────────────────────────────────────────────────────────
function CreatePostModal({ user, onClose, onPosted }) {
  const [type, setType] = useState("remark");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [mediaFile, setMediaFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();
  const { upload, progress, uploading } = useMediaUpload();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !mediaFile) return;
    setSubmitting(true);
    setError("");

    try {
      let mediaUrl = null;
      let mediaType = null;
      if (mediaFile) {
        mediaUrl = await upload(mediaFile);
        mediaType = mediaFile.type.startsWith("video") ? "video" : "image";
      }

      await addDoc(collection(db, "community_posts"), {
        type,
        text: text.trim(),
        mediaUrl,
        mediaType,
        rating: type === "review" ? rating : null,
        authorName: user.displayName || user.email?.split("@")[0] || "User",
        authorUid: user.uid,
        authorEmail: user.email,
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
      });

      onPosted();
      onClose();
    } catch (err) {
      console.error("Post error:", err);
      if (err.code === "permission-denied") {
        setError("❌ Firestore permission denied. Go to Firebase Console → Firestore → Rules and set: allow read, write: if true;");
      } else if (err.code === "not-found" || err.message?.includes("not-found")) {
        setError("❌ Firestore database not created yet. Go to Firebase Console → Firestore Database → Create Database.");
      } else {
        setError(`❌ Error: ${err.message || "Unknown error. Check browser console."}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const POST_TYPES = [
    { key: "remark", label: "💬 Remark" },
    { key: "review", label: "⭐ Review" },
    { key: "photo", label: "📷 Photo" },
    { key: "video", label: "🎥 Video" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel w-full max-w-lg flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-(--text) flex items-center gap-2">
            <Sparkles size={20} className="text-(--primary)" /> New Post
          </h2>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-xl bg-(--bg-alt) flex items-center justify-center text-(--text-secondary) hover:text-(--text)">
            <X size={16} />
          </motion.button>
        </div>

        {/* Type Selector */}
        <div className="grid grid-cols-4 gap-2">
          {POST_TYPES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setType(key)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${type === key ? "bg-(--primary) text-white shadow-lg" : "bg-(--bg-alt) text-(--text-secondary) hover:text-(--text)"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Text */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              type === "remark" ? "Share your gardening experience…" :
                type === "review" ? "Write your product or app review…" :
                  type === "photo" ? "Caption your photo (optional)…" :
                    "Describe your video (optional)…"
            }
            rows={4}
            className="w-full bg-(--bg-alt) border border-(--border) rounded-2xl px-4 py-3 text-sm text-(--text) placeholder:text-(--text-secondary) focus:outline-none focus:border-(--primary) resize-none"
          />

          {/* Rating (review only) */}
          {type === "review" && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-(--text-secondary)">Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)}>
                    <Star size={22} className={s <= rating ? "text-amber-400" : "text-(--border)"} fill={s <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Media Upload */}
          {(type === "photo" || type === "video") && (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept={type === "photo" ? "image/*" : "video/*"}
                onChange={handleFile}
                className="hidden"
              />
              {preview ? (
                <div className="relative rounded-2xl overflow-hidden">
                  {type === "photo"
                    ? <img src={preview} alt="Preview" className="w-full max-h-56 object-cover" />
                    : <video src={preview} controls className="w-full max-h-56" />
                  }
                  <button
                    type="button"
                    onClick={() => { setMediaFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 flex items-center justify-center text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  onClick={() => fileRef.current.click()}
                  className="w-full border-2 border-dashed border-(--border) hover:border-(--primary) rounded-2xl py-10 flex flex-col items-center gap-3 text-(--text-secondary) hover:text-(--primary) transition-colors"
                >
                  {type === "photo" ? <Image size={32} /> : <Video size={32} />}
                  <span className="text-sm font-semibold">Click to upload {type}</span>
                  <span className="text-xs">{type === "photo" ? "PNG, JPG, WEBP" : "MP4, MOV, WEBM"}</span>
                </motion.button>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-(--text-secondary) mb-1">
                    <span>Uploading…</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-(--bg-alt) rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-(--primary) rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={submitting || uploading || (!text.trim() && !mediaFile)}
            className="w-full py-3 rounded-2xl bg-linear-to-r from-(--primary) to-(--secondary) text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {(submitting || uploading) ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {submitting ? "Posting…" : uploading ? `Uploading ${Math.round(progress)}%…` : "Post to Community"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Community() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return unsub;
  }, []);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Fetch error:", err);
      // If Firestore not enabled, just show empty feed — don't crash
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleLike = async (postId, alreadyLiked) => {
    if (!user) return;
    const ref = doc(db, "community_posts", postId);
    await updateDoc(ref, {
      likes: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
            ...p,
            likes: alreadyLiked
              ? p.likes.filter((id) => id !== user.uid)
              : [...(p.likes || []), user.uid],
          }
          : p
      )
    );
  };

  const handleComment = async (postId, comment) => {
    const ref = doc(db, "community_posts", postId);
    await updateDoc(ref, { comments: arrayUnion(comment) });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p
      )
    );
  };

  const FILTERS = ["all", "remark", "review", "photo", "video"];
  const filtered = filter === "all" ? posts : posts.filter((p) => p.type === filter);

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto flex flex-col gap-8">

        {/* Hero */}
        <section className="shop-hero-banner relative overflow-hidden rounded-[2.5rem] mb-2">
          <div className="absolute inset-0 mesh-gradient opacity-60" />
          <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent" />
          <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-(--primary) font-bold tracking-widest text-sm mb-4">
                <Users size={16} /> BLOOMIFY COMMUNITY
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Share Your <span className="text-transparent bg-clip-text bg-linear-to-r from-(--primary) to-(--secondary)">Green Journey</span>
              </h1>
              <p className="text-white/80 text-base max-w-md">
                Post reviews, remarks, photos and videos. Inspire and connect with fellow plant lovers.
              </p>
            </div>
            {user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="flex-shrink-0 px-8 py-4 rounded-2xl bg-linear-to-r from-(--primary) to-(--secondary) text-white font-bold text-base shadow-xl shadow-emerald-500/20 flex items-center gap-2"
              >
                <Sparkles size={18} /> Create Post
              </motion.button>
            ) : (
              <div className="flex-shrink-0 px-8 py-4 rounded-2xl bg-white/10 text-white font-semibold text-sm border border-white/20">
                🔐 Login to post
              </div>
            )}
          </div>
        </section>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filter === f ? "bg-(--primary) text-white shadow-lg" : "bg-(--bg-alt) text-(--text-secondary) hover:text-(--text) border border-(--border)"}`}
            >
              {f === "all" ? "🌿 All" : f === "remark" ? "💬 Remarks" : f === "review" ? "⭐ Reviews" : f === "photo" ? "📷 Photos" : "🎥 Videos"}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-3xl bg-(--bg-alt) animate-pulse border border-(--border)" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel !p-20 flex flex-col items-center text-center gap-4">
            <div className="text-6xl">🌱</div>
            <h3 className="text-2xl font-bold text-(--text)">
              {filter === "all" ? "Be the first to post!" : `No ${filter}s yet`}
            </h3>
            <p className="text-(--text-secondary) max-w-sm text-sm">
              {user ? "Share something with the community." : "Login to start sharing your gardening journey."}
            </p>
            {user && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="px-6 py-3 rounded-xl bg-(--primary) text-white font-bold text-sm"
              >
                Create First Post
              </motion.button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filtered.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && user && (
          <CreatePostModal
            user={user}
            onClose={() => setShowModal(false)}
            onPosted={fetchPosts}
          />
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
