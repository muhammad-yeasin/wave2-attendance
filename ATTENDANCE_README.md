# Attendance Web Application

একটি সহজ এবং কার্যকর উপস্থিতি রেকর্ডিং অ্যাপ্লিকেশন যা শুধুমাত্র বাংলায় তৈরি।

## বৈশিষ্ট্য

- **শর্তসাপেক্ষ ধাপে ধাপে ফর্ম**: ইমেইল যাচাই → WhatsApp নম্বর (যদি থাকে না) → উপস্থিতি
- **সময় বিধিনিষেধ**: রাত ৮টা থেকে ১২টা (বাংলাদেশ সময়, UTC+6) এর মধ্যেই শুধু উপস্থিতি গ্রহণযোগ্য
- **প্রতিদিন এক বার**: একজন ব্যবহারকারী প্রতিদিন শুধু একবার উপস্থিতি দিতে পারবেন
- **মোবাইল অপ্টিমাইজড**: Tailwind CSS দিয়ে তৈরি সম্পূর্ণ প্রতিক্রিয়াশীল ডিজাইন
- **সম্পূর্ণ বাংলা UI**: সকল লেবেল, বার্তা এবং ত্রুটি বার্তা বাংলায়

## টেকনোলজি স্ট্যাক

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS
- **Form Management**: react-hook-form + Zod validation
- **UI Components**: shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MongoDB + Mongoose
- **Timezone**: Asia/Dhaka (UTC+6)

## পরিবেশ সেটআপ

### প্রয়োজনীয় পরিবেশ ভেরিয়েবল

`.env.local` ফাইল তৈরি করুন:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
MONGODB_DB=attendance_db
```

## ইনস্টলেশন

```bash
# প্যাকেজ ইনস্টল করুন
pnpm install

# ডেভেলপমেন্ট সার্ভার চালু করুন
pnpm dev
```

ব্রাউজার খুলুন এবং [http://localhost:3000](http://localhost:3000) যান।

## ব্যবহারকারী ডাটাবেস সেটআপ

শুরু করার আগে MongoDB-তে কমপক্ষে একজন ব্যবহারকারী যুক্ত করুন:

```javascript
db.users.insertOne({
  name: "রহিম আহমেদ",
  email: "rahim@example.com",
  whatsappNumber: "01712345678", // প্রথমবার এলে এটি শুধু সংরক্ষিত হবে
  currentModuleNumber: null,
  currentMilestoneNumber: null,
  lastAttendanceAt: null,
})
```

## API এন্ডপয়েন্ট

### `GET /api/attendance/window`
সময় উপলব্ধতা পরীক্ষা করুন এবং বর্তমান বাংলাদেশ সময় পান।

**Response:**
```json
{
  "allowed": true,
  "now": {
    "year": 2026,
    "month": 1,
    "day": 11,
    "hour": 21,
    "minute": 30,
    "second": 45,
    "dateString": "2026-01-11",
    "timeString": "21:30:45"
  },
  "message": "উপস্থিতি দেওয়ার সময় চলছে..."
}
```

### `POST /api/verify-email`
ইমেইল দ্বারা ব্যবহারকারী যাচাই করুন।

**Request:**
```json
{
  "email": "rahim@example.com"
}
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "রহিম আহমেদ",
    "email": "rahim@example.com",
    "hasWhatsapp": true,
    "whatsappNumber": "01712345678"
  },
  "message": "ইমেইল যাচাই সম্পন্ন হয়েছে।"
}
```

### `POST /api/update-whatsapp`
WhatsApp নম্বর সংরক্ষণ করুন (বৈধতা: ১১ সংখ্যার নম্বর, ০১ দিয়ে শুরু)।

**Request:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "whatsappNumber": "01712345678"
}
```

### `POST /api/attendance`
উপস্থিতি জমা দিন এবং সংরক্ষণ করুন।

**Request:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "moduleNumber": 3,
  "milestoneNumber": 5,
  "studyHours": 2.5,
  "learningSummary": "আজ JavaScript এবং DOM API শিখেছি"
}
```

**Response:**
```json
{
  "message": "উপস্থিতি সংরক্ষণ সম্পন্ন হয়েছে। ধন্যবাদ!",
  "attendanceId": "507f1f77bcf86cd799439012"
}
```

## ডাটাবেস স্কিমা

### User সংগ্রহ
```
{
  _id: ObjectId
  name: String (required)
  email: String (required, unique)
  whatsappNumber: String (optional)
  currentModuleNumber: Number (optional)
  currentMilestoneNumber: Number (optional)
  lastAttendanceAt: Date (optional)
  createdAt: Date
  updatedAt: Date
}
```

### Attendance সংগ্রহ
```
{
  _id: ObjectId
  userId: ObjectId (reference to User, required)
  moduleNumber: Number (required)
  milestoneNumber: Number (required)
  studyHours: Number (required)
  learningSummary: String (required)
  attendanceDate: String (YYYY-MM-DD, required)
  attendanceTime: String (HH:mm:ss, required)
  createdAt: Date
  updatedAt: Date
}
```

**Unique Index**: `(userId, attendanceDate)` - প্রতিদিন প্রতিটি ব্যবহারকারীর জন্য শুধু একটি উপস্থিতি।

## ফ্লো চার্ট

```
ব্যবহারকারী আসে
    ↓
সময় পরীক্ষা করো (20:00-23:59 Asia/Dhaka?)
    ↓ (হ্যাঁ)
সময়টি পাওয়া গেছে বার্তা প্রদর্শন করুন
    ↓ (না)
ফর্ম প্রদর্শন করুন
    ↓
Step 1: ইমেইল যাচাই
    ↓
    ইমেইল DB তে আছে?
        ↓ (না) → ত্রুটি প্রদর্শন করুন
        ↓ (হ্যাঁ) → Step 2 এ যান
Step 2: WhatsApp নম্বর
    ↓
    ব্যবহারকারীর কাছে ইতিমধ্যেই নম্বর আছে?
        ↓ (হ্যাঁ) → Step 3 এ যান (স্কিপ করুন)
        ↓ (না) → নম্বর সংগ্রহ করুন এবং সংরক্ষণ করুন
Step 3: উপস্থিতি জমা দিন
    ↓
    ডুপ্লিকেট চেক: আজকের জন্য ইতিমধ্যেই উপস্থিতি আছে?
        ↓ (হ্যাঁ) → ত্রুটি প্রদর্শন করুন
        ↓ (না) → সংরক্ষণ করুন + সাফল্য বার্তা প্রদর্শন করুন
```

## স্ক্রিপ্ট এবং কমান্ড

```bash
# ডেভেলপমেন্ট সার্ভার চালু করুন
pnpm dev

# উৎপাদনের জন্য বিল্ড করুন
pnpm build

# উৎপাদনে চালান
pnpm start

# Linting চেক করুন
pnpm lint
```

## হাইলাইটস

✅ **সম্পূর্ণ বাংলা**: UI, লেবেল, ত্রুটি - সবকিছু বাংলা  
✅ **প্রতিক্রিয়াশীল**: মোবাইল-ফার্স্ট ডিজাইন  
✅ **সুরক্ষিত সার্ভার-সাইড ভ্যালিডেশন**: সকল ক্ষেত্রে  
✅ **সময় জোন সচেতন**: Asia/Dhaka এ স্বয়ংক্রিয়  
✅ **ডুপ্লিকেট প্রতিরোধ**: প্রতিদিন একবার শুধুমাত্র  
✅ **ব্যবহারকারী-বান্ধব**: ধাপে ধাপে ফর্ম প্রবাহ

## লাইসেন্স

MIT
