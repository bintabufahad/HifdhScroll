"use client";

import { useEffect, useState } from "react";

export type Lang = "en" | "ar";

const STORAGE_KEY = "rusookh-lang";

/**
 * Every user-facing UI string, in English and Arabic (fusha). Quranic text is
 * NEVER translated here - it always comes from the Quran API. These are only
 * interface strings.
 */
const STRINGS = {
  // ---- Home + settings ----
  tagline: {
    en: "Your companion for the Qur'an — memorize through short reels, and study with focus.",
    ar: "رفيقك مع القرآن — احفظ عبر مقاطع قصيرة، وادرس بتركيز.",
  },
  reelsTitle: { en: "Quran Reels", ar: "مقاطع القرآن" },
  reelsDesc: {
    en: "Short, looping ayah reels with recitation and scenery — for memorization.",
    ar: "مقاطع قصيرة متكررة للآيات مع التلاوة والمناظر — للحفظ.",
  },
  reelsOpen: { en: "Open Reels →", ar: "افتح المقاطع ←" },
  studyTitle: { en: "Student of Knowledge", ar: "طالب العلم" },
  studyDesc: {
    en: "A focused study space: simulated class, lecture & course player, timer, to-do list.",
    ar: "مساحة دراسة مركزة: فصل دراسي، محاضرات ومنهج، مؤقّت، وقائمة مهام.",
  },
  studyOpen: { en: "Open Dashboard →", ar: "افتح اللوحة ←" },
  newHere: { en: "New here?", ar: "جديد هنا؟" },
  signInFree: { en: "Sign in free", ar: "سجّل مجانًا" },
  reviews: { en: "Reviews", ar: "التقييمات" },
  settings: { en: "Settings", ar: "الإعدادات" },
  signedInAs: { en: "Signed in as", ar: "مسجّل الدخول باسم" },
  notSignedIn: { en: "Not signed in", ar: "لم يتم تسجيل الدخول" },
  logout: { en: "Log out", ar: "تسجيل الخروج" },
  language: { en: "Language", ar: "اللغة" },
  sendAyah: { en: "Send an ayah", ar: "أهدِ آية" },
  feelTitle: { en: "When You Feel…", ar: "عندما تشعر…" },
  home: { en: "Home", ar: "الرئيسية" },

  // ---- Sign-in (waitlist) ----
  signInTitle: { en: "Sign in to Rusookh", ar: "تسجيل الدخول إلى رسوخ" },
  signInSubtitle: {
    en: "Enter your email — we'll send you a sign-in link. It's completely free.",
    ar: "أدخل بريدك الإلكتروني وسنرسل لك رابط الدخول — مجانًا تمامًا.",
  },
  namePlaceholder: { en: "Name (optional)", ar: "الاسم (اختياري)" },
  emailPlaceholder: { en: "Email", ar: "البريد الإلكتروني" },
  sendLinkBtn: { en: "Email me a sign-in link", ar: "أرسل لي رابط الدخول" },
  sendingBtn: { en: "Sending…", ar: "جارٍ الإرسال…" },
  checkEmail: { en: "Check your email", ar: "تفقّد بريدك الإلكتروني" },
  weSentLinkTo: { en: "We sent a sign-in link to", ar: "أرسلنا رابط الدخول إلى" },
  openAndTap: {
    en: "Open the email and tap “Sign in to Rusookh” — that's it, you'll be signed in.",
    ar: "افتح الرسالة واضغط «تسجيل الدخول إلى رسوخ» — وستدخل مباشرة.",
  },
  cantFindEmail: {
    en: "Can't find it? Check your spam folder. The link can take a minute to arrive.",
    ar: "لا تجد الرسالة؟ تحقّق من مجلد البريد غير المرغوب فيه — قد يتأخر وصولها دقيقة.",
  },
  useDifferentEmail: { en: "Use a different email", ar: "استخدام بريد آخر" },
  linkDidntWork: {
    en: "That sign-in link didn't work — it may have already been used or expired. Enter your email below to get a fresh one.",
    ar: "لم يعمل رابط الدخول — ربما استُخدم من قبل أو انتهت صلاحيته. أدخل بريدك أدناه للحصول على رابط جديد.",
  },

  // ---- Reels setup ----
  selectPassage: { en: "Select passage", ar: "اختر المقطع" },
  modeSurah: { en: "surah", ar: "سورة" },
  modePage: { en: "page", ar: "صفحة" },
  modeRange: { en: "range", ar: "نطاق" },
  mushafPage: { en: "Mushaf page", ar: "صفحة المصحف" },
  start: { en: "Start", ar: "البداية" },
  end: { en: "End", ar: "النهاية" },
  ayahWord: { en: "Ayah", ar: "الآية" },
  ayahsWord: { en: "ayahs", ar: "آية" },
  reciters: { en: "Reciters", ar: "القرّاء" },
  selectYourReciters: { en: "(select your reciters)", ar: "(اختر قرّاءك)" },
  selectedCount: { en: "selected", ar: "محدد" },
  generateReels: { en: "Generate Reels", ar: "إنشاء المقاطع" },

  // ---- Reel player ----
  newReels: { en: "‹ New reels", ar: "‹ مقاطع جديدة" },
  reelComplete: { en: "Reel complete", ar: "اكتمل المقطع" },
  replay: { en: "Replay", ar: "إعادة" },
  pausedTap: { en: "Paused — tap to resume", ar: "متوقف — اضغط للمتابعة" },

  // ---- Study hub ----
  classesBack: { en: "← Classes", ar: "→ الفصول" },
  createFirstClass: { en: "Create your first class", ar: "أنشئ فصلك الأول" },
  focusRoomLine: {
    en: "Your focus room — timer, lecture, planner, and a call you can share.",
    ar: "غرفتك للتركيز — مؤقّت ومحاضرة وقائمة مهام ومكالمة يمكنك مشاركتها.",
  },
  newClass: { en: "New class", ar: "فصل جديد" },
  createClass: { en: "Create class", ar: "إنشاء الفصل" },
  openingClass: { en: "Opening class…", ar: "جارٍ فتح الفصل…" },
  classNamePlaceholder: { en: "Name your class (e.g. Fajr Halaqah)", ar: "سمِّ فصلك (مثال: حلقة الفجر)" },
  cancel: { en: "Cancel", ar: "إلغاء" },
  couldntCreateClass: { en: "Couldn't create the class. Please try again.", ar: "تعذّر إنشاء الفصل. حاول مرة أخرى." },
  signInAgain: { en: "Please sign in again.", ar: "يرجى تسجيل الدخول مرة أخرى." },
  enterClass: { en: "Enter", ar: "دخول" },
  copyLink: { en: "Copy link", ar: "نسخ الرابط" },
  copiedLink: { en: "✓ Copied", ar: "✓ تم النسخ" },
  deleteClass: { en: "Delete class", ar: "حذف الفصل" },

  // ---- Class room ----
  inviteFriends: { en: "👥 Invite friends", ar: "👥 ادعُ أصدقاءك" },
  joinCall: { en: "📹 Join call", ar: "📹 انضمّ للمكالمة" },
  inviteMore: { en: "🔗 Invite", ar: "🔗 دعوة" },
  leaveCall: { en: "Leave", ar: "مغادرة" },
  joinMyClass: { en: "Join my class on Rusookh", ar: "انضم إلى فصلي في رسوخ" },
  couldntShare: {
    en: "Couldn't share — copy the link from your address bar.",
    ar: "تعذّرت المشاركة — انسخ الرابط من شريط العنوان.",
  },
  focusCompleteA: { en: "Focus session complete —", ar: "اكتملت جلسة التركيز —" },
  focusCompleteB: { en: "min. Baarak Allahu feek!", ar: "دقيقة. بارك الله فيك!" },

  // ---- Timer ----
  timerStart: { en: "Start", ar: "ابدأ" },
  timerPause: { en: "Pause", ar: "إيقاف مؤقت" },
  timerEnd: { en: "End", ar: "إنهاء" },

  // ---- To-do list ----
  todoList: { en: "To-do list", ar: "قائمة المهام" },
  addTaskPlaceholder: { en: "Add a task…", ar: "أضف مهمة…" },
  add: { en: "Add", ar: "إضافة" },
  noTasksYet: { en: "No tasks yet — add your first one above.", ar: "لا مهام بعد — أضف مهمتك الأولى في الأعلى." },
  deleteTask: { en: "Delete task", ar: "حذف المهمة" },

  // ---- Lecture ----
  lectureLabel: { en: "Lecture", ar: "المحاضرة" },
  addLectureBtn: { en: "▶ Add lecture", ar: "▶ أضف محاضرة" },
  changeBtn: { en: "Change", ar: "تغيير" },
  lectureLink: { en: "Lecture link", ar: "رابط المحاضرة" },
  pasteYtPlaceholder: { en: "Paste a YouTube video or playlist link…", ar: "الصق رابط فيديو أو قائمة تشغيل من يوتيوب…" },
  playForEveryone: { en: "Play for everyone", ar: "شغّل للجميع" },
  removeCurrentLecture: { en: "Remove current lecture", ar: "إزالة المحاضرة الحالية" },
  tapToPasteYt: {
    en: "Tap to paste a YouTube video or playlist link and play it here",
    ar: "اضغط للصق رابط فيديو أو قائمة تشغيل من يوتيوب وتشغيله هنا",
  },
  notYtLink: {
    en: "That doesn't look like a YouTube link. Paste a full youtube.com or youtu.be URL.",
    ar: "لا يبدو هذا رابط يوتيوب. الصق رابطًا كاملًا من youtube.com أو youtu.be.",
  },
  close: { en: "Close", ar: "إغلاق" },

  // ---- Course ----
  courseBtn: { en: "Course", ar: "المنهج" },
  structuredCourse: { en: "Structured course", ar: "منهج منظّم" },
  lectureTab: { en: "▶ Lecture", ar: "▶ محاضرة" },
  pdfTab: { en: "📄 PDF", ar: "📄 ملف PDF" },
  titleOptional: { en: "Title (optional)", ar: "العنوان (اختياري)" },
  choosePdf: { en: "📄 Choose PDF from device…", ar: "📄 اختر ملف PDF من جهازك…" },
  buildCourseHint: {
    en: "Build your course: add lectures and PDF readings in the order you want to study them.",
    ar: "ابنِ منهجك: أضف المحاضرات والقراءات بالترتيب الذي تريد دراسته.",
  },
  notYtShort: { en: "That doesn't look like a YouTube link.", ar: "لا يبدو هذا رابط يوتيوب." },
  choosePdfFirst: { en: "Choose a PDF file to upload.", ar: "اختر ملف PDF لرفعه." },
  uploadFailed: { en: "Couldn't upload the PDF. Please try again.", ar: "تعذّر رفع الملف. حاول مرة أخرى." },
  saveFailed: { en: "Couldn't save this. Please try again.", ar: "تعذّر الحفظ. حاول مرة أخرى." },
  playlistDefault: { en: "Playlist", ar: "قائمة تشغيل" },
  lectureDefault: { en: "Lecture", ar: "محاضرة" },
  readingDefault: { en: "Reading (PDF)", ar: "قراءة (PDF)" },
  whiteboardBtn: { en: "Whiteboard", ar: "السبورة" },

  // ---- Camera / call ----
  cameraOff: { en: "Camera off", ar: "الكاميرا مغلقة" },
  turnCameraOn: { en: "Turn camera on", ar: "تشغيل الكاميرا" },
  turnCameraOff: { en: "Camera off", ar: "إيقاف الكاميرا" },
  record: { en: "● Record", ar: "● تسجيل" },
  stopRecording: { en: "■ Stop", ar: "■ إيقاف" },
  saveRecording: { en: "↓ Save", ar: "↓ حفظ" },
  staysOnDevice: { en: "Stays on your device", ar: "يبقى على جهازك" },
  you: { en: "You", ar: "أنت" },
  youSuffix: { en: "(you)", ar: "(أنت)" },
  guest: { en: "Guest", ar: "ضيف" },
  mute: { en: "Mute", ar: "كتم الصوت" },
  unmute: { en: "Unmute", ar: "إلغاء الكتم" },
  allowCamMic: {
    en: "Allow camera & microphone access to join the call.",
    ar: "اسمح بالوصول إلى الكاميرا والميكروفون للانضمام إلى المكالمة.",
  },
  cameraBlocked: {
    en: "Camera permission was blocked. Allow it in your browser's site settings, then try again.",
    ar: "تم حظر إذن الكاميرا. اسمح به من إعدادات الموقع في المتصفح ثم حاول مجددًا.",
  },
  noCameraFound: { en: "No camera was found on this device.", ar: "لم يتم العثور على كاميرا في هذا الجهاز." },
  cameraFailed: {
    en: "Couldn't start the camera. You can still study without it.",
    ar: "تعذّر تشغيل الكاميرا. لا يزال بإمكانك الدراسة بدونها.",
  },
  browserNoCamera: {
    en: "This browser can't access the camera. Try a different browser, or study without it.",
    ar: "هذا المتصفح لا يستطيع الوصول إلى الكاميرا. جرّب متصفحًا آخر أو ادرس بدونها.",
  },
  recordingUnsupported: { en: "Recording isn't supported in this browser.", ar: "التسجيل غير مدعوم في هذا المتصفح." },
  recordingFailed: { en: "Couldn't start recording on this device.", ar: "تعذّر بدء التسجيل على هذا الجهاز." },

  // ---- Ustad ----
  ustadWatching: { en: "Your Ustad is watching — stay focused.", ar: "أستاذك يراقبك — ابقَ مركّزًا." },

  // ---- Whiteboard ----
  wbClear: { en: "Clear", ar: "مسح" },
  wbDone: { en: "Done", ar: "تم" },

  // ---- Gift ----
  giftTitleA: { en: "Send an", ar: "أهدِ" },
  giftTitleB: { en: "ayah", ar: "آية" },
  surahLabel: { en: "Surah", ar: "السورة" },
  theirName: { en: "Their name (optional)", ar: "اسم المُهدى إليه (اختياري)" },
  yourName: { en: "Your name (optional)", ar: "اسمك (اختياري)" },
  giftNotePlaceholder: {
    en: "A short personal note (optional) — e.g. “This ayah carried me through a hard week. May it comfort you too.”",
    ar: "رسالة قصيرة (اختياري) — مثال: «حملتني هذه الآية في أسبوع صعب، أسأل الله أن تؤنسك كما آنستني.»",
  },
  createGiftLink: { en: "Create gift link", ar: "أنشئ رابط الهدية" },
  shareGift: { en: "Share the gift", ar: "شارك الهدية" },
  preview: { en: "Preview", ar: "معاينة" },
  giftFor: { en: "A gift for", ar: "هدية إلى" },
  playRecitation: { en: "▶ Play recitation", ar: "▶ تشغيل التلاوة" },
  pauseRecitation: { en: "⏸ Pause recitation", ar: "⏸ إيقاف التلاوة" },
  sendSomeoneAyah: { en: "🎁 Send someone an ayah", ar: "🎁 أهدِ آية لمن تحب" },
  madeWithRusookh: {
    en: "made with Rusookh — your companion for the Qur'an",
    ar: "صُنعت برسوخ — رفيقك مع القرآن",
  },
  anAyahForYou: { en: "An ayah for you 🎁", ar: "آية أُهديت إليك 🎁" },

  // ---- When You Feel ----
  feelHeadingA: { en: "What does the Qur'an say", ar: "ماذا يقول القرآن" },
  feelHeadingB: { en: "when…", ar: "حين…" },
  feelSubtitle: {
    en: "Tap how you feel. Sit with the ayahs. Send one to someone who needs it.",
    ar: "اختر ما تشعر به، وتأمّل الآيات، وأهدِ آيةً لمن يحتاجها.",
  },
  feelingsBack: { en: "← Feelings", ar: "→ المشاعر" },
  whenYouFeel: { en: "When you feel", ar: "حين تشعر أنك" },
  recite: { en: "Recite", ar: "استمع" },
  sendBtn: { en: "🎁 Send", ar: "🎁 أهدِ" },
  someoneFeelsThis: { en: "Someone you know is feeling this too.", ar: "شخص تعرفه يمرّ بهذا الشعور أيضًا." },
  sendThemAyah: { en: "Send them an ayah 🎁", ar: "أهدِه آية 🎁" },
  couldntLoadAyahs: {
    en: "Couldn't load the ayahs right now — please try again in a moment.",
    ar: "تعذّر تحميل الآيات الآن — حاول بعد قليل.",
  },

  // ---- Reviews ----
  reviewsTitleA: { en: "Reviews", ar: "التقييمات" },
  reviewsTitleB: { en: "& Feedback", ar: "والآراء" },
  reviewsSubtitle: {
    en: "What the community says about Rusookh. Your words may be exactly the invitation that brings someone back to the Qur'an.",
    ar: "ما يقوله المجتمع عن رسوخ. ربما تكون كلمتك سببًا في عودة أحدهم إلى القرآن.",
  },
  leaveReview: { en: "Leave a review", ar: "اترك تقييمًا" },
  yourRating: { en: "Your rating", ar: "تقييمك" },
  shareExperience: { en: "Share your experience with Rusookh…", ar: "شارك تجربتك مع رسوخ…" },
  postReview: { en: "Post review", ar: "نشر التقييم" },
  posting: { en: "Posting…", ar: "جارٍ النشر…" },
  alreadyReviewed: {
    en: "You've already left a review — jazakAllah khair. You can add another below any time.",
    ar: "لقد تركت تقييمًا من قبل — جزاك الله خيرًا. يمكنك إضافة تقييم آخر متى شئت.",
  },
  signInWord: { en: "Sign in", ar: "سجّل الدخول" },
  toLeaveReview: { en: "to leave a review.", ar: "لتترك تقييمًا." },
  signInToReview: { en: "Please sign in to leave a review.", ar: "يرجى تسجيل الدخول لترك تقييم." },
  reviewPosted: { en: "JazakAllah khair — your review is posted below.", ar: "جزاك الله خيرًا — تقييمك منشور بالأسفل." },
  reviewFailed: { en: "Couldn't submit your review. Please try again.", ar: "تعذّر إرسال تقييمك. حاول مرة أخرى." },
  reviewsWord: { en: "reviews", ar: "تقييمات" },
  reviewWord: { en: "review", ar: "تقييم" },
  noReviewsYet: {
    en: "No reviews yet — be the first to share your experience.",
    ar: "لا تقييمات بعد — كن أول من يشارك تجربته.",
  },
  deleteMyReview: { en: "Delete my review", ar: "حذف تقييمي" },
  aStudent: { en: "A student", ar: "طالب علم" },
} as const;

export type StringKey = keyof typeof STRINGS;

export function getStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
}

/** Client language hook: persisted in localStorage, defaults to English. */
export function useLanguage() {
  const [lang, setLang] = useState<Lang>("en");

  // Read after mount so server and first client render agree (avoids hydration
  // mismatch); deferred so it isn't a synchronous setState in the effect body.
  useEffect(() => {
    const id = setTimeout(() => setLang(getStoredLang()), 0);
    return () => clearTimeout(id);
  }, []);

  function switchLang(next: Lang) {
    window.localStorage.setItem(STORAGE_KEY, next);
    setLang(next);
  }

  const t = (key: StringKey): string => STRINGS[key][lang];

  return { lang, switchLang, t, dir: (lang === "ar" ? "rtl" : "ltr") as "rtl" | "ltr" };
}
