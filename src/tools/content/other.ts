import type { ToolContent } from "./types";

export const OTHER_CONTENT: Record<string, ToolContent> = {
  /* ---------- Bangla ---------- */

  "bangla-ocr": {
    metaTitle: {
      en: "Bangla OCR: Image and Scanned PDF to Bangla Text",
      bn: "বাংলা OCR: ছবি ও স্ক্যান PDF থেকে বাংলা লেখা",
    },
    metaDescription: {
      en: "Free Bangla OCR that reads Bangla and English text from photos, scans and scanned PDFs. It runs in your browser, so your documents are never uploaded.",
      bn: "ছবি, স্ক্যান বা স্ক্যান করা PDF থেকে বাংলা ও ইংরেজি লেখা বের করুন, একদম ফ্রি। সব কাজ আপনার ব্রাউজারেই হয়, তাই কোনো ডকুমেন্ট কোথাও আপলোড হয় না।",
    },
    intro: {
      en: "Turn a photo of a printed page, a scanned letter or a scanned PDF into editable Bangla and English text. Recognition runs on your own device, which matters for certificates, NID copies, office files and anything else you would rather not upload. The first run downloads about 10 MB of Bangla language data, and your browser keeps it for next time.",
      bn: "ছাপা পৃষ্ঠার ছবি, স্ক্যান করা চিঠি বা স্ক্যান PDF থেকে বাংলা ও ইংরেজি লেখা বের করে আবার টাইপ করার ঝামেলা বাঁচান। লেখা শনাক্ত করার পুরো কাজটা আপনার নিজের ডিভাইসেই হয়, তাই সার্টিফিকেট, এনআইডির কপি বা অফিসের কাগজও নিশ্চিন্তে দিতে পারেন। প্রথমবার প্রায় ১০ MB বাংলা ভাষার ডেটা ডাউনলোড হয়, এরপর সেটা ব্রাউজারেই জমা থাকে।",
    },
    steps: [
      { en: "Drop your photos, scans or scanned PDFs onto the page.", bn: "ছবি, স্ক্যান বা স্ক্যান করা PDF পেজে টেনে আনুন।" },
      { en: "Under Language, pick Bangla + English, Bangla or English.", bn: "“ভাষা” থেকে বাংলা + ইংরেজি, শুধু বাংলা বা শুধু ইংরেজি বেছে নিন।" },
      { en: "For a single PDF, enter the pages to read or leave it blank for all, then click Start OCR.", bn: "একটি PDF হলে কোন পৃষ্ঠাগুলো পড়বেন লিখে দিন, সব পৃষ্ঠার জন্য খালি রাখুন। তারপর “OCR শুরু করুন” চাপুন।" },
      { en: "Check and fix the text in the box, then click Copy text or Download .txt.", bn: "বক্সে লেখাটা মিলিয়ে দরকার হলে ঠিক করুন, তারপর “লেখা কপি করুন” বা “.txt ডাউনলোড করুন” চাপুন।" },
    ],
    faqs: [
      {
        q: { en: "How accurate is Bangla OCR?", bn: "বাংলা OCR কতটা নির্ভুল?" },
        a: {
          en: "On clear, straight, well-lit printed pages it gets most words right, but it is not perfect, so check names and numbers before you use the text. Blurry photos, tilted pages and handwriting give much weaker results.",
          bn: "পরিষ্কার, সোজা আর ভালো আলোয় তোলা ছাপা লেখায় বেশিরভাগ শব্দই ঠিক আসে, তবে শতভাগ নির্ভুল নয়। তাই ব্যবহারের আগে নাম ও সংখ্যা মিলিয়ে নিন। ঝাপসা ছবি, বাঁকা পৃষ্ঠা বা হাতের লেখায় ফল অনেক খারাপ হয়।",
        },
      },
      {
        q: { en: "Can it read text from a scanned PDF?", bn: "স্ক্যান করা PDF থেকে কি লেখা বের করা যায়?" },
        a: {
          en: "Yes. Each PDF page is rendered and read one by one, and for a single PDF you can choose a page range such as 1-3, 5. You can also add several images and PDFs at once.",
          bn: "হ্যাঁ। PDF-এর প্রতিটি পৃষ্ঠা একে একে পড়া হয়। একটি PDF দিলে চাইলে নির্দিষ্ট পৃষ্ঠা বেছে নিতে পারেন, যেমন 1-3, 5। একসাথে একাধিক ছবি ও PDF-ও দেওয়া যায়।",
        },
      },
      {
        q: { en: "Is my document uploaded to a server?", bn: "আমার ডকুমেন্ট কি কোনো সার্ভারে আপলোড হয়?" },
        a: {
          en: "No. The OCR engine and language data are downloaded to your browser, and your files are read on your device. Only the engine is fetched from the internet, never your document.",
          bn: "না। OCR ইঞ্জিন আর ভাষার ডেটা আপনার ব্রাউজারে নামানো হয়, ফাইল পড়া হয় আপনার ডিভাইসেই। ইন্টারনেট থেকে শুধু ইঞ্জিনটা আসে, আপনার ডকুমেন্ট কোথাও যায় না।",
        },
      },
    ],
  },

  "bijoy-to-unicode": {
    metaTitle: {
      en: "Bijoy to Unicode Converter: Fix SutonnyMJ Text",
      bn: "বিজয় থেকে ইউনিকোড কনভার্টার, অনলাইন ফ্রি",
    },
    metaDescription: {
      en: "Convert Bijoy (SutonnyMJ) text that shows up as “Avwg evsjvq” into proper Unicode Bangla. Free, instant, and private: conversion runs on your device.",
      bn: "“Avwg evsjvq”-এর মতো ভাঙা বিজয় (সুতনিএমজে) লেখাকে সঠিক ইউনিকোড বাংলায় রূপান্তর করুন। ফ্রি, তাৎক্ষণিক, আর লেখা আপনার ডিভাইসেই থাকে, কোথাও আপলোড হয় না।",
    },
    intro: {
      en: "If Bangla text turns into gibberish like “Avwg evsjvq Mvb MvB” when you paste it into Facebook, Gmail or Google Docs, it was typed in Bijoy with a SutonnyMJ font. Paste it here and you get real Unicode Bangla that reads correctly everywhere, on any phone or computer. The converted text appears as you type, and nothing leaves your browser.",
      bn: "ফেসবুক, জিমেইল বা গুগল ডকসে পেস্ট করলে বাংলা লেখা যদি “Avwg evsjvq Mvb MvB”-এর মতো হয়ে যায়, বুঝবেন লেখাটা বিজয়ে সুতনিএমজে ফন্টে টাইপ করা। এখানে পেস্ট করলেই পাবেন আসল ইউনিকোড বাংলা, যা যেকোনো ফোন বা কম্পিউটারে ঠিকঠাক পড়া যায়। লিখতে লিখতেই রূপান্তর হয়ে যায়, আর লেখা আপনার ব্রাউজারের বাইরে যায় না।",
    },
    steps: [
      { en: "Paste your Bijoy text into the Bijoy text (SutonnyMJ) box, or click Open .txt file.", bn: "“বিজয় লেখা (সুতনিএমজে)” বক্সে লেখা পেস্ট করুন, অথবা “.txt ফাইল খুলুন” চাপুন।" },
      { en: "Read the Unicode Bangla that appears in the right-hand box as you type.", bn: "পাশের বক্সে সঙ্গে সঙ্গে ইউনিকোড বাংলা দেখা যাবে, একবার মিলিয়ে নিন।" },
      { en: "Click Copy output, or Download .txt to save it as a file.", bn: "“ফলাফল কপি করুন” চাপুন, অথবা ফাইল হিসেবে রাখতে “.txt ডাউনলোড করুন”।" },
    ],
    faqs: [
      {
        q: { en: "Why does my Bangla text show as “Avwg”?", bn: "বাংলা লেখা “Avwg” হয়ে যায় কেন?" },
        a: {
          en: "Bijoy stores Bangla letters in English character slots and relies on a SutonnyMJ font to draw them. Without that font, or on the web, you see the raw English letters, so the text needs converting to Unicode.",
          bn: "বিজয় বাংলা অক্ষরগুলো ইংরেজি অক্ষরের জায়গায় রাখে, আর সুতনিএমজে ফন্ট সেগুলোকে বাংলা আকারে দেখায়। ওই ফন্ট না থাকলে বা ওয়েবে পেস্ট করলে আসল ইংরেজি অক্ষরগুলো বেরিয়ে পড়ে, তাই ইউনিকোডে রূপান্তর করতে হয়।",
        },
      },
      {
        q: { en: "Can I convert a Word or PDF file written in Bijoy?", bn: "বিজয়ে লেখা Word বা PDF ফাইল কি রূপান্তর করা যায়?" },
        a: {
          en: "Copy the text out of the Word file or PDF and paste it into the Bijoy box. The tool works on pasted text and .txt files; it does not open .docx or PDF files directly.",
          bn: "Word বা PDF ফাইল থেকে লেখাটা কপি করে বিজয় বক্সে পেস্ট করুন। এই টুল পেস্ট করা লেখা আর .txt ফাইলে কাজ করে, সরাসরি .docx বা PDF ফাইল খোলে না।",
        },
      },
      {
        q: { en: "Is the Bijoy to Unicode converter free?", bn: "বিজয় থেকে ইউনিকোড কনভার্টার কি ফ্রি?" },
        a: {
          en: "Yes, completely free with no sign-up and no length limit. Conversion happens in your browser, so even long official documents are never uploaded.",
          bn: "হ্যাঁ, পুরোপুরি ফ্রি। সাইন আপ লাগে না, লেখার দৈর্ঘ্যেরও কোনো সীমা নেই। রূপান্তর আপনার ব্রাউজারেই হয়, তাই লম্বা অফিসিয়াল কাগজও কোথাও আপলোড হয় না।",
        },
      },
    ],
  },

  "unicode-to-bijoy": {
    metaTitle: {
      en: "Unicode to Bijoy Converter for SutonnyMJ, Free",
      bn: "ইউনিকোড থেকে বিজয় কনভার্টার (সুতনিএমজে)",
    },
    metaDescription: {
      en: "Convert Unicode Bangla to Bijoy text for SutonnyMJ, ready for press, DTP, Photoshop and InDesign. Free, no sign-up, and your text never leaves your device.",
      bn: "ইউনিকোড বাংলাকে সুতনিএমজে ফন্টের বিজয় লেখায় রূপান্তর করুন, প্রেস, ডিটিপি, ফটোশপ আর ইনডিজাইনের কাজে। ফ্রি, সাইন আপ ছাড়া, লেখা আপনার ডিভাইসেই থাকে।",
    },
    intro: {
      en: "Many presses, DTP shops and older design setups in Bangladesh still work with Bijoy and SutonnyMJ instead of Unicode. Type or paste Unicode Bangla here and copy out Bijoy text you can drop into Word, InDesign or Photoshop. The output looks garbled on screen until you set the font to SutonnyMJ or another Bijoy font, which is expected.",
      bn: "বাংলাদেশের অনেক প্রেস, ডিটিপি দোকান আর পুরোনো ডিজাইন সেটআপে এখনো ইউনিকোড না, বিজয় আর সুতনিএমজে দিয়েই কাজ হয়। এখানে ইউনিকোড বাংলা লিখুন বা পেস্ট করুন, তারপর বিজয় লেখা কপি করে Word, ইনডিজাইন বা ফটোশপে বসান। ফন্ট সুতনিএমজে বা অন্য কোনো বিজয় ফন্ট না করা পর্যন্ত লেখাটা এলোমেলো দেখাবে, এটাই স্বাভাবিক।",
    },
    steps: [
      { en: "Type or paste Unicode Bangla into the Unicode Bangla box, or click Open .txt file.", bn: "“ইউনিকোড বাংলা” বক্সে লিখুন বা পেস্ট করুন, অথবা “.txt ফাইল খুলুন” চাপুন।" },
      { en: "Click Copy output, or Download .txt.", bn: "“ফলাফল কপি করুন” চাপুন, অথবা “.txt ডাউনলোড করুন”।" },
      { en: "Paste it into your document and set the font to SutonnyMJ.", bn: "আপনার ডকুমেন্টে পেস্ট করে ফন্ট সুতনিএমজে করে দিন।" },
    ],
    faqs: [
      {
        q: { en: "Why does the Bijoy output look like English gibberish?", bn: "বিজয় ফলাফল ইংরেজি হিজিবিজির মতো দেখায় কেন?" },
        a: {
          en: "Bijoy text is made of English characters that only look like Bangla in a Bijoy font. Paste it into your document and choose SutonnyMJ, and it will display as Bangla.",
          bn: "বিজয় লেখা আসলে ইংরেজি অক্ষর দিয়ে তৈরি, যা শুধু বিজয় ফন্টেই বাংলা দেখায়। ডকুমেন্টে পেস্ট করে ফন্ট সুতনিএমজে করলেই বাংলা দেখাবে।",
        },
      },
      {
        q: { en: "How do I use Unicode Bangla in Photoshop or InDesign?", bn: "ফটোশপ বা ইনডিজাইনে ইউনিকোড বাংলা কীভাবে ব্যবহার করব?" },
        a: {
          en: "If your setup breaks Unicode Bangla conjuncts, convert the text to Bijoy here, paste it in, and apply SutonnyMJ. That is the usual workaround in press and DTP work.",
          bn: "আপনার সেটআপে যদি ইউনিকোড বাংলার যুক্তাক্ষর ভেঙে যায়, এখানে বিজয়ে রূপান্তর করে পেস্ট করুন আর সুতনিএমজে ফন্ট দিন। প্রেস আর ডিটিপির কাজে এটাই সাধারণ সমাধান।",
        },
      },
      {
        q: { en: "Can I convert it back to Unicode later?", bn: "পরে কি আবার ইউনিকোডে ফেরত আনা যায়?" },
        a: {
          en: "Yes. Click Swap: Bijoy → Unicode and the reverse converter opens with your output already filled in.",
          bn: "হ্যাঁ। “উল্টো করুন: বিজয় → ইউনিকোড” চাপলে বিপরীত কনভার্টারটি আপনার ফলাফল নিয়েই খুলবে।",
        },
      },
    ],
  },

  /* ---------- Image ---------- */

  "resize-image": {
    metaTitle: {
      en: "Resize Image Online in Pixels or Percent, Free",
      bn: "ছবির সাইজ পরিবর্তন: পিক্সেল বা শতাংশে, ফ্রি",
    },
    metaDescription: {
      en: "Resize JPG, PNG and WebP images to exact pixels or by percent, one photo or a whole batch. Free, no watermark, and your images stay on your device.",
      bn: "JPG, PNG ও WebP ছবির মাপ নির্দিষ্ট পিক্সেলে বা শতাংশে বদলান, একটা বা একসাথে অনেকগুলো। ফ্রি, কোনো ওয়াটারমার্ক নেই, আর ছবি আপনার ডিভাইসেই থাকে।",
    },
    intro: {
      en: "Set an exact width and height in pixels, or scale images by a percentage, for forms, websites or social posts. Keep aspect ratio is on by default, so photos fit inside your box without stretching. Add as many images as you like and download them one by one or as a ZIP.",
      bn: "অনলাইন ফর্ম, ওয়েবসাইট বা সোশ্যাল মিডিয়ার জন্য ছবির দৈর্ঘ্য-প্রস্থ নির্দিষ্ট পিক্সেলে দিন, অথবা শতাংশে ছোট-বড় করুন। “অনুপাত ঠিক রাখুন” আগে থেকেই চালু থাকে, তাই ছবি টেনে লম্বা বা চ্যাপ্টা হয় না। যত খুশি ছবি দিন, একটা একটা করে বা ZIP করে একসাথে নামান।",
    },
    steps: [
      { en: "Choose your images.", bn: "ছবিগুলো বেছে নিন।" },
      { en: "Under Resize by, pick Pixels and enter a width and height, or pick Percent and set the scale.", bn: "পিক্সেলে মাপ দিতে চাইলে দৈর্ঘ্য-প্রস্থ লিখুন, অথবা শতাংশ বেছে স্কেল ঠিক করুন।" },
      { en: "Choose an output format if you want to change it, then click Resize images.", bn: "দরকার হলে আউটপুট ফরম্যাট বদলান, তারপর “ছবির মাপ বদলান” চাপুন।" },
      { en: "Click Download, or Download all (ZIP) for several images.", bn: "“ডাউনলোড” চাপুন, একাধিক ছবি হলে “সব ডাউনলোড (ZIP)”।" },
    ],
    faqs: [
      {
        q: { en: "How do I resize a photo for an online application form?", bn: "অনলাইন আবেদনের ফর্মের জন্য ছবির মাপ কীভাবে ঠিক করব?" },
        a: {
          en: "Enter the exact width and height the form asks for, for example 300 × 300 pixels, and resize. If the form also has a file size limit, run the result through Compress image.",
          bn: "ফর্মে যে মাপ চাওয়া হয়েছে, যেমন ৩০০ × ৩০০ পিক্সেল, সেটাই লিখে রিসাইজ করুন। ফাইল সাইজের সীমাও থাকলে ফলাফলটা “ছবি ছোট করুন” টুলে দিয়ে নিন।",
        },
      },
      {
        q: { en: "Will resizing stretch my image?", bn: "মাপ বদলালে কি ছবি টেনে লম্বা হয়ে যাবে?" },
        a: {
          en: "Not with Keep aspect ratio on: each image fits inside the box you set. Turn it off only if you really want the exact size even if it distorts the photo.",
          bn: "“অনুপাত ঠিক রাখুন” চালু থাকলে না, প্রতিটি ছবি আপনার দেওয়া মাপের ভেতরে বসে যায়। ছবি বেঁকে গেলেও হুবহু মাপ চাইলে তবেই এটা বন্ধ করুন।",
        },
      },
      {
        q: { en: "Can I resize many images at once?", bn: "একসাথে অনেক ছবির মাপ কি বদলানো যায়?" },
        a: {
          en: "Yes. Add as many as you like, they all get the same settings, and you can download them together as one ZIP file.",
          bn: "হ্যাঁ। যত খুশি ছবি দিন, সবগুলোতে একই সেটিং বসবে, আর একটা ZIP ফাইলে একসাথে ডাউনলোড করতে পারবেন।",
        },
      },
    ],
  },

  "compress-image": {
    metaTitle: {
      en: "Compress Image Online: Reduce JPG and PNG Size",
      bn: "ছবির সাইজ কমান: JPG, PNG কম্প্রেস অনলাইন",
    },
    metaDescription: {
      en: "Compress JPG, PNG and WebP photos with a quality slider and optional max width. Free, no watermark, works in batches, and images never leave your device.",
      bn: "কোয়ালিটি স্লাইডার দিয়ে JPG, PNG ও WebP ছবির ফাইল সাইজ কমান, চাইলে সর্বোচ্চ প্রস্থও দিন। ফ্রি, ওয়াটারমার্ক ছাড়া, একসাথে অনেক ছবি, আর ছবি ডিভাইসেই থাকে।",
    },
    intro: {
      en: "Shrink photos and screenshots so they fit email attachments, upload limits on job and admission forms, or a faster website. Pick a quality level, optionally cap the width, and save as JPG or WebP. If a compressed file would come out bigger than the original, the original is kept.",
      bn: "ইমেইলে পাঠানো, চাকরি বা ভর্তির ফর্মের আপলোড সীমা, কিংবা দ্রুত ওয়েবসাইটের জন্য ছবি ও স্ক্রিনশটের সাইজ কমান। কোয়ালিটি ঠিক করুন, চাইলে সর্বোচ্চ প্রস্থ দিন, তারপর JPG বা WebP হিসেবে রাখুন। কম্প্রেস করার পর ফাইল যদি আসলটার চেয়ে বড় হয়ে যায়, তাহলে আসল ফাইলটাই রাখা হয়।",
    },
    steps: [
      { en: "Choose your photos, screenshots or PNGs.", bn: "ছবি, স্ক্রিনশট বা PNG ফাইল বেছে নিন।" },
      { en: "Set Quality (60–80% is a good balance) and, if you like, a max width.", bn: "কোয়ালিটি ঠিক করুন (৬০–৮০% ভালো ভারসাম্য), চাইলে সর্বোচ্চ প্রস্থও দিন।" },
      { en: "Pick JPG or WebP as the output format and click Compress images.", bn: "আউটপুট ফরম্যাট JPG বা WebP বেছে “ছবি ছোট করুন” চাপুন।" },
      { en: "Compare before and after, then download one file or all as a ZIP.", bn: "আগে-পরে মিলিয়ে দেখুন, তারপর একটা ফাইল বা সব একসাথে ZIP করে নামান।" },
    ],
    faqs: [
      {
        q: { en: "How do I reduce a photo to under 100 KB?", bn: "ছবি ১০০ KB-এর নিচে কীভাবে আনব?" },
        a: {
          en: "Lower the quality to around 60% and set a max width such as 1000 px, then check the new size shown for each file. Repeat with lower values if it is still too big.",
          bn: "কোয়ালিটি ৬০%-এর মতো কমান আর সর্বোচ্চ প্রস্থ ধরুন ১০০০ px দিন, তারপর প্রতিটি ফাইলের নতুন সাইজ দেখুন। তবুও বড় থাকলে আরও কম মান দিয়ে আবার করুন।",
        },
      },
      {
        q: { en: "Will a PNG keep its transparent background?", bn: "PNG ছবির স্বচ্ছ ব্যাকগ্রাউন্ড কি থাকবে?" },
        a: {
          en: "Only if you choose WebP. JPG has no transparency, so see-through areas are filled with white.",
          bn: "WebP বেছে নিলে থাকবে। JPG-তে স্বচ্ছতা নেই, তাই স্বচ্ছ অংশগুলো সাদা হয়ে যায়।",
        },
      },
      {
        q: { en: "Are my photos uploaded anywhere?", bn: "আমার ছবি কি কোথাও আপলোড হয়?" },
        a: {
          en: "No. Compression happens in your browser on your own device, so personal and work photos stay with you.",
          bn: "না। কম্প্রেস করার কাজ আপনার ডিভাইসে ব্রাউজারের ভেতরেই হয়, তাই ব্যক্তিগত বা অফিসের ছবি আপনার কাছেই থাকে।",
        },
      },
    ],
  },

  "convert-image": {
    metaTitle: {
      en: "Convert Image to JPG, PNG or WebP Online, Free",
      bn: "ছবির ফরম্যাট পরিবর্তন: JPG, PNG, WebP কনভার্টার",
    },
    metaDescription: {
      en: "Convert images to JPG, PNG or WebP, including WebP to JPG and PNG to JPG. Batch convert for free with no watermark; your files stay on your own device.",
      bn: "ছবিকে JPG, PNG বা WebP-তে রূপান্তর করুন, যেমন WebP থেকে JPG বা PNG থেকে JPG। একসাথে অনেক ছবি, ফ্রি, ওয়াটারমার্ক ছাড়া, আর ফাইল আপনার ডিভাইসেই থাকে।",
    },
    intro: {
      en: "Change an image's format when a site rejects WebP, when you need a smaller JPG, or when you want a lossless PNG. It opens JPG, PNG, WebP, GIF, BMP, AVIF and SVG, and saves as JPG, PNG or WebP. HEIC photos from iPhones open only in browsers that support them, such as Safari.",
      bn: "কোনো সাইট WebP নেয় না, ছোট JPG দরকার, কিংবা মান না হারানো PNG চান, তখন ছবির ফরম্যাট বদলে নিন। JPG, PNG, WebP, GIF, BMP, AVIF ও SVG খোলা যায়, আর সেভ করা যায় JPG, PNG বা WebP হিসেবে। iPhone-এর HEIC ছবি শুধু যেসব ব্রাউজার সাপোর্ট করে সেখানেই খোলে, যেমন Safari।",
    },
    steps: [
      { en: "Choose the images you want to convert.", bn: "যে ছবিগুলো রূপান্তর করবেন, বেছে নিন।" },
      { en: "Pick the output format: JPG, PNG or WebP, and set the quality for JPG or WebP.", bn: "আউটপুট ফরম্যাট JPG, PNG বা WebP বেছে নিন, JPG বা WebP হলে কোয়ালিটিও ঠিক করুন।" },
      { en: "Click Convert images.", bn: "রূপান্তর শুরু করুন।" },
      { en: "Download each file, or all of them as a ZIP.", bn: "প্রতিটি ফাইল আলাদা করে, বা সব একসাথে ZIP করে ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "How do I convert WebP to JPG?", bn: "WebP থেকে JPG কীভাবে করব?" },
        a: {
          en: "Add the WebP file, choose JPG as the output format and convert. Any transparent areas become white, since JPG cannot store transparency.",
          bn: "WebP ফাইলটা দিন, আউটপুট ফরম্যাট JPG বেছে রূপান্তর করুন। JPG-তে স্বচ্ছতা থাকে না বলে স্বচ্ছ অংশগুলো সাদা হয়ে যাবে।",
        },
      },
      {
        q: { en: "Can I convert iPhone HEIC photos?", bn: "iPhone-এর HEIC ছবি কি রূপান্তর করা যায়?" },
        a: {
          en: "Only in a browser that can open HEIC, which in practice means Safari. In Chrome or Firefox, set your iPhone to save photos as JPEG (Settings → Camera → Formats → Most Compatible) instead.",
          bn: "যে ব্রাউজার HEIC খুলতে পারে শুধু সেখানেই, বাস্তবে মূলত Safari-তে। Chrome বা Firefox ব্যবহার করলে iPhone-এ ছবি JPEG হিসেবে সেভ করার সেটিং দিন (Settings → Camera → Formats → Most Compatible)।",
        },
      },
      {
        q: { en: "What happens to animated GIFs?", bn: "অ্যানিমেটেড GIF-এর কী হবে?" },
        a: {
          en: "Only the first frame is kept, so you get a still image in the format you chose.",
          bn: "শুধু প্রথম ফ্রেমটা রাখা হয়, তাই আপনার বেছে নেওয়া ফরম্যাটে একটা স্থির ছবি পাবেন।",
        },
      },
    ],
  },

  "crop-image": {
    metaTitle: {
      en: "Crop Image Online: Free Photo Cropper",
      bn: "ছবি ক্রপ করুন অনলাইন, ফ্রি ফটো ক্রপার",
    },
    metaDescription: {
      en: "Crop a photo by dragging a box, with free or fixed aspect ratios, at full resolution. Free, no sign-up, no watermark, and your image stays on your device.",
      bn: "বক্স টেনে ছবি ক্রপ করুন, ইচ্ছেমতো বা নির্দিষ্ট অনুপাতে, পুরো রেজোলিউশনে। ফ্রি, সাইন আপ বা ওয়াটারমার্ক ছাড়া, আর ছবি আপনার ডিভাইসেই থাকে।",
    },
    intro: {
      en: "Cut away the edges you don't want and keep just the part that matters, such as a face for a profile picture or one item from a screenshot. Drag the box, resize it from a corner, or lock it to an aspect ratio. The crop is saved at the original resolution in the same format as your image.",
      bn: "ছবির বাড়তি অংশ ফেলে দিয়ে শুধু দরকারি জায়গাটুকু রাখুন, যেমন প্রোফাইল ছবির জন্য মুখ, বা স্ক্রিনশট থেকে একটা অংশ। বক্স টেনে সরান, কোণা ধরে ছোট-বড় করুন, অথবা নির্দিষ্ট অনুপাতে আটকে দিন। ক্রপ করা ছবি মূল রেজোলিউশনে, আগের ফরম্যাটেই সেভ হয়।",
    },
    steps: [
      { en: "Choose an image.", bn: "একটি ছবি বেছে নিন।" },
      { en: "Pick an aspect ratio, or leave it on Free.", bn: "অনুপাত বেছে নিন, অথবা ইচ্ছেমতো রাখুন।" },
      { en: "Drag the box to move it or drag a corner to resize; arrow keys nudge it.", bn: "বক্স টেনে সরান বা কোণা টেনে ছোট-বড় করুন, অ্যারো কি দিয়েও একটু একটু সরানো যায়।" },
      { en: "Click Crop, then download the result.", bn: "ক্রপ চাপুন, তারপর ছবিটা ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "How do I crop a photo to a square?", bn: "ছবি বর্গাকারে কীভাবে ক্রপ করব?" },
        a: {
          en: "Choose the 1:1 aspect ratio, place the box over the area you want, and click Crop.",
          bn: "১:১ অনুপাত বেছে নিন, বক্সটা পছন্দের জায়গায় বসান, তারপর ক্রপ চাপুন।",
        },
      },
      {
        q: { en: "Does cropping reduce image quality?", bn: "ক্রপ করলে কি ছবির মান কমে?" },
        a: {
          en: "No. The crop is taken from the full-resolution image, so the pixels you keep are unchanged. JPG files are re-saved at high quality.",
          bn: "না। ক্রপ করা হয় পূর্ণ রেজোলিউশনের ছবি থেকে, তাই যে অংশটুকু রাখছেন তার পিক্সেল বদলায় না। JPG ফাইল উঁচু মানেই আবার সেভ হয়।",
        },
      },
      {
        q: { en: "Can I crop several images at once?", bn: "একসাথে কয়েকটা ছবি কি ক্রপ করা যায়?" },
        a: {
          en: "No, this tool crops one image at a time so you can place the box exactly. Click Change image to crop the next one.",
          bn: "না, বক্সটা ঠিক জায়গায় বসানোর জন্য এই টুলে একবারে একটা ছবি ক্রপ হয়। পরের ছবির জন্য “ছবি বদলান” চাপুন।",
        },
      },
    ],
  },

  "rotate-image": {
    metaTitle: {
      en: "Rotate Image Online: Turn or Flip a Photo",
      bn: "ছবি ঘোরান ও উল্টান অনলাইন, ফ্রি",
    },
    metaDescription: {
      en: "Rotate a photo 90° left or right, turn it 180°, or flip it horizontally or vertically at full resolution. Free and private; the image stays on your device.",
      bn: "ছবি ৯০° বামে বা ডানে ঘোরান, ১৮০° উল্টান, কিংবা আড়াআড়ি বা খাড়াভাবে আয়নার মতো ফ্লিপ করুন, পূর্ণ রেজোলিউশনে। ফ্রি, আর ছবি আপনার ডিভাইসেই থাকে।",
    },
    intro: {
      en: "Fix a sideways phone photo or a scan that came out upside down, or mirror a selfie so text reads the right way. Rotate in 90° steps and flip horizontally or vertically, with a live preview. The result is saved at full resolution in the original format.",
      bn: "পাশ ফিরে থাকা মোবাইলের ছবি বা উল্টো হয়ে আসা স্ক্যান ঠিক করুন, কিংবা সেলফি আয়নার মতো উল্টে লেখা সোজা করুন। ৯০° করে ঘোরান আর আড়াআড়ি বা খাড়াভাবে ফ্লিপ করুন, সঙ্গে সঙ্গে প্রিভিউ দেখে। ফলাফল মূল ফরম্যাটে, পূর্ণ রেজোলিউশনে সেভ হয়।",
    },
    steps: [
      { en: "Choose an image.", bn: "একটি ছবি বেছে নিন।" },
      { en: "Click Left 90°, Right 90° or Rotate 180°, and Flip horizontal or Flip vertical if needed.", bn: "বামে ৯০°, ডানে ৯০° বা ১৮০° ঘোরান, দরকার হলে আড়াআড়ি বা খাড়া ফ্লিপ করুন।" },
      { en: "Check the preview and click Apply.", bn: "প্রিভিউ দেখে নিয়ে প্রয়োগ করুন।" },
      { en: "Download the rotated image.", bn: "ঘোরানো ছবিটা ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "Why does my photo look sideways after uploading?", bn: "আপলোড করার পর ছবি পাশ ফিরে যায় কেন?" },
        a: {
          en: "Phones often save the picture one way and store a rotation flag that some sites ignore. Rotating it here writes the pixels the right way up, so it displays correctly everywhere.",
          bn: "ফোন অনেক সময় ছবি এক দিকে সেভ করে আর ঘোরানোর একটা চিহ্ন আলাদা রাখে, যা কিছু সাইট মানে না। এখানে ঘোরালে ছবির পিক্সেলই সোজা করে লেখা হয়, তাই সব জায়গায় ঠিক দেখায়।",
        },
      },
      {
        q: { en: "How do I mirror an image?", bn: "ছবি আয়নার মতো উল্টাব কীভাবে?" },
        a: {
          en: "Click Flip horizontal to mirror left and right, or Flip vertical to turn it upside down like a reflection in water.",
          bn: "বাম-ডান উল্টাতে আড়াআড়ি ফ্লিপ চাপুন, আর পানিতে প্রতিবিম্বের মতো ওপর-নিচ উল্টাতে খাড়া ফ্লিপ চাপুন।",
        },
      },
      {
        q: { en: "Does rotating lose quality?", bn: "ঘোরালে কি ছবির মান কমে?" },
        a: {
          en: "Rotation happens at full resolution with no cropping. PNG and WebP stay lossless; JPG is re-saved at high quality.",
          bn: "পূর্ণ রেজোলিউশনে ঘোরানো হয়, কোনো অংশ কাটা পড়ে না। PNG ও WebP-এর মান অটুট থাকে, JPG উঁচু মানে আবার সেভ হয়।",
        },
      },
    ],
  },

  "round-image": {
    metaTitle: {
      en: "Round Image Corners or Make a Circle Photo",
      bn: "ছবির কোণা গোল করুন বা গোল ছবি বানান",
    },
    metaDescription: {
      en: "Add rounded corners to any image or crop it into a perfect circle, saved as PNG with transparent corners. Free, no watermark, and nothing is uploaded.",
      bn: "যেকোনো ছবির কোণা গোল করুন বা পুরো গোল ছবি বানান, স্বচ্ছ কোণাসহ PNG হিসেবে সেভ হবে। ফ্রি, ওয়াটারমার্ক ছাড়া, আর কোনো কিছু আপলোড হয় না।",
    },
    intro: {
      en: "Give a photo soft rounded corners for a website or presentation, or turn it into a circle for a profile picture. Set the corner radius with a slider, or choose Make circle to crop to a centred square and round it fully. The result is a PNG, so the corners stay transparent on any background.",
      bn: "ওয়েবসাইট বা প্রেজেন্টেশনের জন্য ছবির কোণা নরম গোল করুন, অথবা প্রোফাইল ছবির জন্য পুরো গোল বানান। স্লাইডার দিয়ে কোণার বাঁক ঠিক করুন, বা “গোল বানান” বেছে নিলে মাঝখান থেকে বর্গাকারে কেটে পুরো গোল করা হবে। ফলাফল PNG, তাই যেকোনো ব্যাকগ্রাউন্ডে কোণাগুলো স্বচ্ছ থাকে।",
    },
    steps: [
      { en: "Choose an image.", bn: "একটি ছবি বেছে নিন।" },
      { en: "Drag the Corner radius slider, or tick Make circle.", bn: "কোণার বাঁকের স্লাইডার টানুন, অথবা গোল বানানোর অপশন চালু করুন।" },
      { en: "Check the preview and click Apply.", bn: "প্রিভিউ দেখে প্রয়োগ করুন।" },
      { en: "Download the PNG.", bn: "PNG ফাইলটা ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "How do I make a circular profile picture?", bn: "গোল প্রোফাইল ছবি কীভাবে বানাব?" },
        a: {
          en: "Tick Make circle. The image is cropped to a centred square and rounded into a circle with transparent corners.",
          bn: "গোল বানানোর অপশনটা চালু করুন। ছবি মাঝখান থেকে বর্গাকারে কেটে স্বচ্ছ কোণাসহ গোল করা হবে।",
        },
      },
      {
        q: { en: "Why is the output a PNG and not a JPG?", bn: "ফলাফল JPG না হয়ে PNG কেন?" },
        a: {
          en: "JPG cannot store transparency, so rounded corners would turn white. PNG keeps them see-through.",
          bn: "JPG-তে স্বচ্ছতা রাখা যায় না, তাই গোল কোণাগুলো সাদা হয়ে যেত। PNG-তে কোণাগুলো স্বচ্ছ থাকে।",
        },
      },
      {
        q: { en: "What radius gives fully round ends?", bn: "কত রেডিয়াস দিলে পুরো গোল হবে?" },
        a: {
          en: "50% on a square image makes a circle; on a rectangle it gives pill-shaped ends.",
          bn: "বর্গাকার ছবিতে ৫০% দিলে গোল হয়, আর আয়তাকার ছবিতে দুই পাশ ক্যাপসুলের মতো গোল হয়।",
        },
      },
    ],
  },

  "add-border": {
    metaTitle: {
      en: "Add Border to Image Online: Photo Frame Tool",
      bn: "ছবিতে বর্ডার যোগ করুন অনলাইন, ফ্রি",
    },
    metaDescription: {
      en: "Add a solid coloured border to a photo, set its exact width in pixels, and round the corners. Free, no watermark, and the image stays on your device.",
      bn: "ছবির চারপাশে পছন্দের রঙের বর্ডার দিন, পিক্সেলে নির্দিষ্ট প্রস্থ ঠিক করুন, চাইলে কোণাও গোল করুন। ফ্রি, ওয়াটারমার্ক ছাড়া, আর ছবি আপনার ডিভাইসেই থাকে।",
    },
    intro: {
      en: "Frame a photo with a clean border for social posts, product shots or printing. Choose any colour, set the width with a slider or as an exact number of pixels, and optionally round the corners. The border is added around the image at full resolution, so nothing in the photo is cut off.",
      bn: "সোশ্যাল মিডিয়া পোস্ট, পণ্যের ছবি বা প্রিন্টের জন্য ছবির চারপাশে পরিষ্কার একটা বর্ডার দিন। যেকোনো রং বাছুন, স্লাইডার দিয়ে বা পিক্সেলে নির্দিষ্ট করে প্রস্থ দিন, চাইলে কোণা গোল করুন। বর্ডার ছবির বাইরে দিয়ে পূর্ণ রেজোলিউশনে বসে, তাই ছবির কোনো অংশ কাটা পড়ে না।",
    },
    steps: [
      { en: "Choose an image.", bn: "একটি ছবি বেছে নিন।" },
      { en: "Pick a colour and set the width, or type an exact width in px.", bn: "রং বাছুন আর প্রস্থ ঠিক করুন, অথবা px-এ নির্দিষ্ট প্রস্থ লিখুন।" },
      { en: "Tick Rounded corners if you want them, then click Apply.", bn: "চাইলে গোল কোণা চালু করুন, তারপর প্রয়োগ করুন।" },
      { en: "Download the framed image.", bn: "বর্ডারসহ ছবিটা ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "Does the border cover part of my photo?", bn: "বর্ডার কি ছবির কিছু অংশ ঢেকে দেয়?" },
        a: {
          en: "No. The border is added outside the image, so the final picture is larger by twice the border width on each side.",
          bn: "না। বর্ডার ছবির বাইরে যোগ হয়, তাই চূড়ান্ত ছবিটা প্রতি দিকে বর্ডারের দ্বিগুণ প্রস্থ বড় হয়।",
        },
      },
      {
        q: { en: "Can I add a white border for Instagram?", bn: "ইনস্টাগ্রামের জন্য কি সাদা বর্ডার দেওয়া যায়?" },
        a: {
          en: "Yes. Set the colour to white and pick a width. The border is the same on all four sides.",
          bn: "হ্যাঁ। রং সাদা করে প্রস্থ ঠিক করুন। চার পাশেই বর্ডার সমান হবে।",
        },
      },
      {
        q: { en: "What format is the result saved in?", bn: "ফলাফল কোন ফরম্যাটে সেভ হয়?" },
        a: {
          en: "The same format as your original. With rounded corners on, it is saved as PNG so the corners stay transparent.",
          bn: "আপনার মূল ছবির ফরম্যাটেই। গোল কোণা চালু থাকলে PNG হিসেবে সেভ হয়, যাতে কোণাগুলো স্বচ্ছ থাকে।",
        },
      },
    ],
  },

  "image-to-base64": {
    metaTitle: {
      en: "Image to Base64 Converter: Get a Data URI",
      bn: "ছবি থেকে Base64: Data URI কনভার্টার",
    },
    metaDescription: {
      en: "Convert a PNG, JPG, SVG or other image to a Base64 string or data URI you can paste into HTML or CSS. Free, instant, and the image never leaves your device.",
      bn: "PNG, JPG, SVG বা অন্য ছবিকে Base64 স্ট্রিং বা data URI-তে রূপান্তর করুন, HTML বা CSS-এ বসানোর জন্য। ফ্রি, সঙ্গে সঙ্গে, আর ছবি আপনার ডিভাইস ছেড়ে যায় না।",
    },
    intro: {
      en: "Get an image as text so you can embed it straight into HTML, CSS, JSON or an email template. Copy the full data URI or the Base64 part alone. This works best for small icons and logos; Base64 is about a third larger than the file itself.",
      bn: "ছবিকে লেখা হিসেবে নিন, যাতে সরাসরি HTML, CSS, JSON বা ইমেইল টেমপ্লেটে বসাতে পারেন। পুরো data URI বা শুধু Base64 অংশটা কপি করুন। ছোট আইকন আর লোগোর জন্য এটা সবচেয়ে ভালো, কারণ Base64 মূল ফাইলের চেয়ে প্রায় এক-তৃতীয়াংশ বড় হয়।",
    },
    steps: [
      { en: "Choose an image.", bn: "একটি ছবি বেছে নিন।" },
      { en: "Pick Data URI or Base64 only.", bn: "Data URI নাকি শুধু Base64, বেছে নিন।" },
      { en: "Click Copy and paste it into your code.", bn: "কপি করে আপনার কোডে পেস্ট করুন।" },
    ],
    faqs: [
      {
        q: { en: "How do I use a Base64 image in HTML?", bn: "HTML-এ Base64 ছবি কীভাবে ব্যবহার করব?" },
        a: {
          en: "Copy the data URI and put it in the src attribute, like <img src=\"data:image/png;base64,...\">. In CSS, use it inside url().",
          bn: "data URI কপি করে src অ্যাট্রিবিউটে বসান, যেমন <img src=\"data:image/png;base64,...\">। CSS-এ url()-এর ভেতরে দিন।",
        },
      },
      {
        q: { en: "What is the difference between a data URI and Base64?", bn: "data URI আর Base64-এর পার্থক্য কী?" },
        a: {
          en: "A data URI is the Base64 text with a prefix like data:image/png;base64, that tells the browser the file type. Use Base64 only when a tool or API asks for just the encoded string.",
          bn: "data URI হলো Base64 লেখার সামনে data:image/png;base64, এর মতো একটা অংশ, যা ব্রাউজারকে ফাইলের ধরন জানায়। কোনো টুল বা API শুধু এনকোড করা স্ট্রিং চাইলে তখন শুধু Base64 নিন।",
        },
      },
      {
        q: { en: "Should I convert large photos to Base64?", bn: "বড় ছবি কি Base64 করা উচিত?" },
        a: {
          en: "Usually not. Above roughly 10 KB a normal image file is better, because Base64 is bigger and inlined images can't be cached separately.",
          bn: "সাধারণত না। প্রায় ১০ KB-এর বেশি হলে সাধারণ ছবির ফাইলই ভালো, কারণ Base64 আকারে বড় হয় আর কোডের ভেতরে বসানো ছবি আলাদা করে ক্যাশ হয় না।",
        },
      },
    ],
  },

  "color-palette": {
    metaTitle: {
      en: "Color Picker from Image and Palette Generator",
      bn: "ছবি থেকে রং বাছাই ও কালার প্যালেট তৈরি",
    },
    metaDescription: {
      en: "Pick any colour from an image and get its HEX, RGB and HSL codes, plus an automatic colour palette. Free, no sign-up, and your image stays on your device.",
      bn: "ছবির যেকোনো জায়গা থেকে রং বাছুন আর HEX, RGB ও HSL কোড নিন, সঙ্গে স্বয়ংক্রিয় কালার প্যালেট। ফ্রি, সাইন আপ ছাড়া, আর ছবি আপনার ডিভাইসেই থাকে।",
    },
    intro: {
      en: "Find the exact colour of a logo, a product photo or a design you like. Click anywhere on the image to read its HEX, RGB and HSL values, and get a palette of its main colours pulled out automatically. Handy for matching brand colours in a poster, website or banner.",
      bn: "পছন্দের লোগো, পণ্যের ছবি বা ডিজাইনের হুবহু রংটা খুঁজে বের করুন। ছবির যেকোনো জায়গায় ক্লিক করলেই HEX, RGB ও HSL মান পাবেন, আর ছবির মূল রংগুলো দিয়ে একটা প্যালেট নিজে থেকেই তৈরি হবে। পোস্টার, ওয়েবসাইট বা ব্যানারে ব্র্যান্ডের রং মেলাতে কাজে লাগে।",
    },
    steps: [
      { en: "Choose an image.", bn: "একটি ছবি বেছে নিন।" },
      { en: "Click anywhere on the image to pick a colour.", bn: "রং নিতে ছবির যেকোনো জায়গায় ক্লিক করুন।" },
      { en: "Set the Number of colours for the palette.", bn: "প্যালেটে কয়টা রং চান, ঠিক করুন।" },
      { en: "Copy a HEX, RGB or HSL code, or click Copy all for the whole palette.", bn: "HEX, RGB বা HSL কোড কপি করুন, পুরো প্যালেটের জন্য “সব কপি” চাপুন।" },
    ],
    faqs: [
      {
        q: { en: "How do I find the HEX code of a colour in a picture?", bn: "ছবির কোনো রঙের HEX কোড কীভাবে বের করব?" },
        a: {
          en: "Open the image here and click on the colour. The HEX code appears with RGB and HSL, ready to copy.",
          bn: "ছবিটা এখানে খুলে রঙের ওপর ক্লিক করুন। RGB ও HSL-এর সাথে HEX কোডও দেখাবে, সরাসরি কপি করা যায়।",
        },
      },
      {
        q: { en: "How is the palette made?", bn: "প্যালেট কীভাবে তৈরি হয়?" },
        a: {
          en: "The tool samples pixels across the image and groups similar ones to find its main colours. You choose how many colours to show.",
          bn: "টুলটি পুরো ছবি থেকে পিক্সেলের নমুনা নিয়ে কাছাকাছি রংগুলো একসাথে করে মূল রংগুলো খুঁজে বের করে। কয়টা রং দেখাবে, সেটা আপনি ঠিক করেন।",
        },
      },
      {
        q: { en: "Is my image uploaded?", bn: "আমার ছবি কি আপলোড হয়?" },
        a: {
          en: "No. The image is read in your browser, so even unreleased designs stay private.",
          bn: "না। ছবিটা আপনার ব্রাউজারেই পড়া হয়, তাই এখনো প্রকাশ না করা ডিজাইনও গোপন থাকে।",
        },
      },
    ],
  },

  /* ---------- Data & text ---------- */

  "csv-to-json": {
    metaTitle: {
      en: "CSV to JSON Converter Online, Free and Private",
      bn: "CSV থেকে JSON কনভার্টার অনলাইন, ফ্রি",
    },
    metaDescription: {
      en: "Convert CSV to JSON with auto delimiter detection, header rows, number and true/false detection, and minify. Free, and your data never leaves your browser.",
      bn: "CSV থেকে JSON রূপান্তর করুন, ডিলিমিটার নিজে থেকে শনাক্ত হয়, হেডার, সংখ্যা ও true/false চেনা আর মিনিফাইসহ। ফ্রি, আর আপনার ডেটা ব্রাউজারের বাইরে যায় না।",
    },
    intro: {
      en: "Turn a spreadsheet export into JSON for an app, API or script. Comma, semicolon, tab and pipe files are detected automatically, and each row becomes an object keyed by the header row. Data is parsed in your browser, so customer lists and reports are never uploaded.",
      bn: "স্প্রেডশিট থেকে এক্সপোর্ট করা ডেটা অ্যাপ, API বা স্ক্রিপ্টের জন্য JSON-এ রূপান্তর করুন। কমা, সেমিকোলন, ট্যাব বা পাইপ, কোন ডিলিমিটার তা নিজে থেকেই ধরা হয়, আর হেডার সারি অনুযায়ী প্রতিটি সারি একটা অবজেক্ট হয়। সব কাজ ব্রাউজারেই হয়, তাই কাস্টমার লিস্ট বা রিপোর্ট কোথাও আপলোড হয় না।",
    },
    steps: [
      { en: "Paste CSV, open a file, or drop one in.", bn: "CSV পেস্ট করুন, ফাইল খুলুন বা টেনে আনুন।" },
      { en: "Check the options: delimiter, First row is the header, and Detect numbers and true/false.", bn: "অপশনগুলো দেখে নিন: ডিলিমিটার, প্রথম সারি হেডার কি না, আর সংখ্যা ও true/false চেনা।" },
      { en: "Choose an indent or Minify.", bn: "ইনডেন্ট বা মিনিফাই বেছে নিন।" },
      { en: "Copy the JSON or click Download.", bn: "JSON কপি করুন বা ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "How do I convert an Excel sheet to JSON?", bn: "Excel শিট থেকে JSON কীভাবে বানাব?" },
        a: {
          en: "Save the sheet as CSV from Excel or Google Sheets (File → Save As or Download → CSV), then open that file here.",
          bn: "Excel বা Google Sheets থেকে শিটটা CSV হিসেবে সেভ করুন (File → Save As বা Download → CSV), তারপর সেই ফাইলটা এখানে খুলুন।",
        },
      },
      {
        q: { en: "Will values like 007 or long IDs be changed?", bn: "007 বা লম্বা আইডির মতো মান কি বদলে যাবে?" },
        a: {
          en: "No. Even with number detection on, values like 007 and long IDs stay as text so nothing is lost.",
          bn: "না। সংখ্যা চেনার অপশন চালু থাকলেও 007 বা লম্বা আইডির মতো মান লেখা হিসেবেই থাকে, তাই কিছু হারায় না।",
        },
      },
      {
        q: { en: "What if my CSV has no header row?", bn: "CSV-তে হেডার সারি না থাকলে কী হবে?" },
        a: {
          en: "Turn off First row is the header and each row becomes an array of values instead of an object.",
          bn: "“প্রথম সারি হেডার” বন্ধ করে দিন, তখন প্রতিটি সারি অবজেক্টের বদলে মানের একটা অ্যারে হবে।",
        },
      },
    ],
  },

  "json-to-csv": {
    metaTitle: {
      en: "JSON to CSV Converter: Open JSON in Excel",
      bn: "JSON থেকে CSV কনভার্টার, Excel-এ খোলার জন্য",
    },
    metaDescription: {
      en: "Convert a JSON array to CSV for Excel or Google Sheets, with nested objects flattened and an Excel-friendly UTF-8 option. Free and private, nothing uploaded.",
      bn: "JSON অ্যারেকে Excel বা Google Sheets-এর জন্য CSV-তে রূপান্তর করুন, নেস্টেড অবজেক্ট সমান করে আর Excel-এর জন্য UTF-8 অপশনসহ। ফ্রি, কিছুই আপলোড হয় না।",
    },
    intro: {
      en: "Turn JSON from an API or export into a table you can open in Excel or Google Sheets. Nested objects become dot keys like city.name, and you can pick which list to export when the array is inside an object. Add a UTF-8 BOM so Bangla text shows correctly in Excel.",
      bn: "API বা এক্সপোর্ট থেকে পাওয়া JSON-কে এমন টেবিলে আনুন যা Excel বা Google Sheets-এ খোলা যায়। নেস্টেড অবজেক্ট city.name-এর মতো ডট কি হয়ে যায়, আর অ্যারেটা কোনো অবজেক্টের ভেতরে থাকলে কোন লিস্ট এক্সপোর্ট হবে তা বেছে নিতে পারেন। UTF-8 BOM যোগ করলে Excel-এ বাংলা লেখা ঠিকঠাক দেখায়।",
    },
    steps: [
      { en: "Paste JSON, open a file, or drop one in.", bn: "JSON পেস্ট করুন, ফাইল খুলুন বা টেনে আনুন।" },
      { en: "If the array sits inside an object, choose it under Which list?", bn: "অ্যারেটা কোনো অবজেক্টের ভেতরে থাকলে কোন লিস্ট এক্সপোর্ট হবে, বেছে নিন।" },
      { en: "Pick a delimiter and tick Add UTF-8 BOM for Excel if needed.", bn: "ডিলিমিটার বাছুন, আর দরকার হলে Excel-এর জন্য UTF-8 BOM চালু করুন।" },
      { en: "Check the preview and click Download CSV.", bn: "প্রিভিউ দেখে CSV ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "Why does Bangla text look broken when I open the CSV in Excel?", bn: "Excel-এ CSV খুললে বাংলা ভেঙে যায় কেন?" },
        a: {
          en: "Excel guesses the wrong encoding unless the file starts with a UTF-8 BOM. Tick Add UTF-8 BOM for Excel before downloading and Bangla will display correctly.",
          bn: "ফাইলের শুরুতে UTF-8 BOM না থাকলে Excel ভুল এনকোডিং ধরে নেয়। ডাউনলোডের আগে “Excel-এর জন্য UTF-8 BOM” চালু করুন, বাংলা ঠিকমতো দেখাবে।",
        },
      },
      {
        q: { en: "How are nested objects and arrays handled?", bn: "নেস্টেড অবজেক্ট আর অ্যারে কীভাবে সামলানো হয়?" },
        a: {
          en: "Nested objects become dot-named columns such as city.name. Arrays stay in one JSON cell unless you tick Spread nested arrays into columns, which gives tags.0, tags.1 and so on.",
          bn: "নেস্টেড অবজেক্ট city.name-এর মতো ডট দেওয়া কলাম হয়ে যায়। অ্যারে একটা ঘরে JSON হিসেবে থাকে, তবে “নেস্টেড অ্যারে কলামে ছড়িয়ে দিন” চালু করলে tags.0, tags.1 এভাবে আলাদা কলাম হয়।",
        },
      },
      {
        q: { en: "Can I use a semicolon instead of a comma?", bn: "কমার বদলে কি সেমিকোলন দেওয়া যায়?" },
        a: {
          en: "Yes. Choose comma, semicolon or tab as the delimiter; semicolon suits Excel in regions that use a comma as the decimal mark.",
          bn: "হ্যাঁ। ডিলিমিটার হিসেবে কমা, সেমিকোলন বা ট্যাব বেছে নিন। যেসব অঞ্চলে দশমিকের জন্য কমা ব্যবহার হয়, সেখানকার Excel-এ সেমিকোলন ভালো কাজ করে।",
        },
      },
    ],
  },

  "json-formatter": {
    metaTitle: {
      en: "JSON Formatter and Validator: Beautify or Minify",
      bn: "JSON ফরম্যাটার ও ভ্যালিডেটর অনলাইন",
    },
    metaDescription: {
      en: "Format, validate and minify JSON online. Pick 2 spaces, 4 spaces or tabs, sort keys A to Z, and see the error line. Free; your JSON stays in your browser.",
      bn: "JSON সাজান, যাচাই করুন বা মিনিফাই করুন। ২ স্পেস, ৪ স্পেস বা ট্যাব বাছুন, কি A থেকে Z সাজান, আর ভুলের লাইন দেখুন। ফ্রি, JSON আপনার ব্রাউজারেই থাকে।",
    },
    intro: {
      en: "Paste messy or one-line JSON and get it neatly indented, or squeeze it down to a single line. If the JSON is invalid, you see the line and column of the problem. Because nothing is sent to a server, it is safe for API responses that contain tokens or customer data.",
      bn: "এলোমেলো বা এক লাইনের JSON পেস্ট করুন, সুন্দর করে সাজানো রূপ পাবেন, অথবা পুরোটা এক লাইনে ছোট করে নিন। JSON-এ ভুল থাকলে কোন লাইন আর কলামে সমস্যা, তা দেখাবে। কোনো সার্ভারে কিছু পাঠানো হয় না, তাই টোকেন বা কাস্টমারের তথ্যসহ API রেসপন্সও নিশ্চিন্তে দিতে পারেন।",
    },
    steps: [
      { en: "Paste JSON, open a file, or drop one in.", bn: "JSON পেস্ট করুন, ফাইল খুলুন বা টেনে আনুন।" },
      { en: "Choose Format or Minify, and the indent style.", bn: "ফরম্যাট বা মিনিফাই বেছে নিন, আর ইনডেন্টের ধরন ঠিক করুন।" },
      { en: "Tick Sort keys A→Z if you want keys in order.", bn: "কি-গুলো ক্রমানুসারে চাইলে A→Z সাজানোর অপশন চালু করুন।" },
      { en: "Copy the result or click Download JSON.", bn: "ফলাফল কপি করুন বা JSON ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "How do I find the error in my JSON?", bn: "JSON-এর ভুল কীভাবে খুঁজে পাব?" },
        a: {
          en: "Paste it in. Invalid JSON shows an error with the line and column, which usually points to a missing comma, an extra trailing comma or an unquoted key.",
          bn: "পেস্ট করুন। JSON ভুল হলে লাইন আর কলামসহ ত্রুটি দেখাবে, যা সাধারণত বাদ পড়া কমা, শেষে বাড়তি কমা বা কোটেশন ছাড়া কি-এর দিকে ইঙ্গিত করে।",
        },
      },
      {
        q: { en: "What does minify JSON do?", bn: "JSON মিনিফাই করলে কী হয়?" },
        a: {
          en: "It removes all spaces and line breaks that aren't needed, giving the smallest valid JSON for sending over a network or storing.",
          bn: "অপ্রয়োজনীয় সব স্পেস আর লাইন ব্রেক সরিয়ে দেয়, ফলে নেটওয়ার্কে পাঠানো বা সংরক্ষণের জন্য সবচেয়ে ছোট বৈধ JSON পাওয়া যায়।",
        },
      },
      {
        q: { en: "Will very large numbers stay exact?", bn: "খুব বড় সংখ্যা কি হুবহু থাকবে?" },
        a: {
          en: "Numbers beyond JavaScript's safe range get rounded, and the tool warns you when that happens. Store such IDs as strings if they must stay exact.",
          bn: "JavaScript-এর নিরাপদ সীমার বাইরের সংখ্যা গোল হয়ে যায়, আর তেমন হলে টুল আপনাকে সতর্ক করে। এ ধরনের আইডি হুবহু রাখতে হলে স্ট্রিং হিসেবে রাখুন।",
        },
      },
    ],
  },

  "word-counter": {
    metaTitle: {
      en: "Word Counter for English and Bangla Text",
      bn: "বাংলা শব্দ গণনা: Word ও অক্ষর কাউন্টার",
    },
    metaDescription: {
      en: "Count words, characters, sentences and paragraphs, with reading and speaking time. Handles Bangla correctly. Free, and your text never leaves the device.",
      bn: "শব্দ, অক্ষর, বাক্য আর অনুচ্ছেদ গুনুন, সঙ্গে পড়া ও বলার আনুমানিক সময়। বাংলা লেখাও ঠিকভাবে গোনে। ফ্রি, আর আপনার লেখা ডিভাইসের বাইরে যায় না।",
    },
    intro: {
      en: "Check the length of an essay, assignment, article or social post as you type. It counts words, characters with and without spaces, sentences, lines and paragraphs, and estimates reading and speaking time. Bangla is counted properly: a conjunct like ক্ষ counts as one letter, and the দাঁড়ি (।) ends a sentence.",
      bn: "রচনা, অ্যাসাইনমেন্ট, আর্টিকেল বা সোশ্যাল পোস্ট লিখতে লিখতেই দৈর্ঘ্য দেখে নিন। শব্দ, স্পেসসহ ও স্পেস ছাড়া অক্ষর, বাক্য, লাইন আর অনুচ্ছেদ গোনা হয়, সঙ্গে পড়া ও বলার আনুমানিক সময়। বাংলা ঠিকভাবে গোনা হয়: ক্ষ-এর মতো যুক্তাক্ষর একটা অক্ষর ধরা হয়, আর দাঁড়ি (।) দিয়ে বাক্য শেষ হয়।",
    },
    steps: [
      { en: "Type or paste your text into the box.", bn: "বক্সে আপনার লেখা টাইপ বা পেস্ট করুন।" },
      { en: "Read the word, character, sentence and paragraph counts as they update.", bn: "শব্দ, অক্ষর, বাক্য আর অনুচ্ছেদের সংখ্যা সঙ্গে সঙ্গে দেখুন।" },
      { en: "Check Details for reading time, speaking time and top keywords.", bn: "বিস্তারিত অংশে পড়ার সময়, বলার সময় আর বেশি ব্যবহৃত শব্দ দেখুন।" },
    ],
    faqs: [
      {
        q: { en: "Does the word counter work for Bangla?", bn: "বাংলা লেখায় কি শব্দ গণনা ঠিক হয়?" },
        a: {
          en: "Yes. It splits Bangla words correctly, counts conjuncts like ক্ষ as one letter, and treats । as the end of a sentence. You can mix Bangla and English in the same text.",
          bn: "হ্যাঁ। বাংলা শব্দ ঠিকভাবে আলাদা করে, ক্ষ-এর মতো যুক্তাক্ষরকে একটা অক্ষর ধরে, আর । দেখে বাক্য শেষ ধরে। একই লেখায় বাংলা-ইংরেজি মেশানো থাকলেও সমস্যা নেই।",
        },
      },
      {
        q: { en: "How is reading time calculated?", bn: "পড়ার সময় কীভাবে হিসাব হয়?" },
        a: {
          en: "Reading time assumes 200 words per minute and speaking time assumes 130 words per minute, which are common averages.",
          bn: "পড়ার সময় ধরা হয় মিনিটে ২০০ শব্দ, আর বলার সময় মিনিটে ১৩০ শব্দ, যা সাধারণ গড় হিসাব।",
        },
      },
      {
        q: { en: "Why are there two character counts for Bangla?", bn: "বাংলার জন্য অক্ষরের দুই রকম হিসাব কেন?" },
        a: {
          en: "Letters (graphemes) count what you see, so ক্ষ is one. Code units count every Unicode piece, which is how many websites and forms enforce length limits.",
          bn: "চোখে যা দেখেন সেভাবে গোনা হলে ক্ষ একটা অক্ষর। আবার কোড ইউনিটে প্রতিটি ইউনিকোড অংশ আলাদা গোনা হয়, অনেক ওয়েবসাইট আর ফর্ম এভাবেই দৈর্ঘ্যের সীমা মাপে।",
        },
      },
    ],
  },

  "case-converter": {
    metaTitle: {
      en: "Case Converter: UPPER, lower, Title and camelCase",
      bn: "কেস কনভার্টার: UPPER, lower, Title Case অনলাইন",
    },
    metaDescription: {
      en: "Convert text to UPPER CASE, lower case, Title Case, Sentence case, camelCase, snake_case, kebab-case and more. Free, instant, and nothing is uploaded.",
      bn: "লেখাকে UPPER CASE, lower case, Title Case, Sentence case, camelCase, snake_case, kebab-case সহ আরও অনেক ফরম্যাটে বদলান। ফ্রি, সঙ্গে সঙ্গে, কিছুই আপলোড হয় না।",
    },
    intro: {
      en: "Fix text typed with Caps Lock on, tidy up headings in Title Case, or turn phrases into variable names for code. Pick a case and the result updates as you type. Bangla has no capital letters, so any Bangla in your text passes through unchanged.",
      bn: "Caps Lock চালু রেখে টাইপ করা লেখা ঠিক করুন, শিরোনাম Title Case-এ সাজান, অথবা কোডের জন্য বাক্যকে ভেরিয়েবলের নাম বানান। একটা কেস বাছলেই লিখতে লিখতে ফলাফল বদলে যায়। বাংলায় বড়-ছোট হাতের অক্ষর নেই, তাই লেখার বাংলা অংশ যেমন আছে তেমনই থাকে।",
    },
    steps: [
      { en: "Type or paste your text.", bn: "আপনার লেখা টাইপ বা পেস্ট করুন।" },
      { en: "Pick a case, such as Title Case, snake_case or camelCase.", bn: "একটা কেস বাছুন, যেমন Title Case, snake_case বা camelCase।" },
      { en: "Copy the result, or click Download .txt.", bn: "ফলাফল কপি করুন, অথবা .txt ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "How do I change ALL CAPS text to normal?", bn: "সব বড় হাতের লেখা কীভাবে স্বাভাবিক করব?" },
        a: {
          en: "Paste it and choose Sentence case. Each sentence starts with a capital letter and the rest is lowercase.",
          bn: "লেখাটা পেস্ট করে Sentence case বেছে নিন। প্রতিটি বাক্য বড় হাতের অক্ষর দিয়ে শুরু হবে, বাকিটা ছোট হাতের।",
        },
      },
      {
        q: { en: "Does Title Case keep small words lowercase?", bn: "Title Case-এ কি ছোট শব্দগুলো ছোট হাতের থাকে?" },
        a: {
          en: "It can. Turn on the option to keep words like a, an, the, of and in lowercase, except when they are first or last.",
          bn: "চাইলে থাকে। অপশনটা চালু করলে a, an, the, of, in-এর মতো শব্দ ছোট হাতের থাকবে, শুধু প্রথম বা শেষ শব্দ হলে বড় হবে।",
        },
      },
      {
        q: { en: "Can it convert many lines to snake_case at once?", bn: "অনেক লাইন একসাথে কি snake_case করা যায়?" },
        a: {
          en: "Yes. camelCase, snake_case and the other code styles work line by line, so each line becomes its own identifier.",
          bn: "হ্যাঁ। camelCase, snake_case আর অন্যান্য কোড স্টাইল লাইন ধরে কাজ করে, তাই প্রতিটি লাইন আলাদা একটা নাম হয়।",
        },
      },
    ],
  },

  base64: {
    metaTitle: {
      en: "Base64 Encode and Decode Online, Unicode Safe",
      bn: "Base64 এনকোড ও ডিকোড অনলাইন, বাংলাসহ",
    },
    metaDescription: {
      en: "Encode text or files to Base64 and decode Base64 back to text or a file. UTF-8 safe for Bangla and emoji, with a URL-safe option. Free and fully private.",
      bn: "লেখা বা ফাইলকে Base64-এ এনকোড করুন, আবার Base64 থেকে লেখা বা ফাইলে ফেরত আনুন। বাংলা ও ইমোজির জন্য UTF-8, URL-safe অপশনসহ। ফ্রি, পুরোপুরি গোপন।",
    },
    intro: {
      en: "Encode and decode Base64 for APIs, config files, email headers and data URIs. Text is handled as UTF-8, so Bangla and emoji round-trip correctly instead of turning into question marks. You can also turn any file into Base64, or decode a Base64 string back into a downloadable file.",
      bn: "API, কনফিগ ফাইল, ইমেইল হেডার বা data URI-এর জন্য Base64 এনকোড ও ডিকোড করুন। লেখা UTF-8 হিসেবে নেওয়া হয়, তাই বাংলা আর ইমোজি প্রশ্নবোধক চিহ্ন না হয়ে ঠিকঠাক ফেরত আসে। যেকোনো ফাইলকেও Base64 বানাতে পারেন, আবার Base64 থেকে ডাউনলোডযোগ্য ফাইলও ফেরত পেতে পারেন।",
    },
    steps: [
      { en: "Choose Text or File as the input type.", bn: "ইনপুটের ধরন হিসেবে লেখা বা ফাইল বেছে নিন।" },
      { en: "Pick Encode or Decode.", bn: "এনকোড বা ডিকোড বেছে নিন।" },
      { en: "Type, paste or choose a file; tick URL-safe alphabet or Output as data URI if you need them.", bn: "লেখা টাইপ বা পেস্ট করুন, বা ফাইল দিন। দরকার হলে URL-safe বা data URI আউটপুট চালু করুন।" },
      { en: "Copy the output or download it.", bn: "আউটপুট কপি করুন বা ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "Why does decoded Bangla text show as garbage on other sites?", bn: "অন্য সাইটে ডিকোড করলে বাংলা হিজিবিজি হয় কেন?" },
        a: {
          en: "Many tools decode bytes as Latin-1 instead of UTF-8. This tool encodes and decodes text as UTF-8, so Bangla comes back exactly as it was.",
          bn: "অনেক টুল বাইটগুলোকে UTF-8 না ধরে Latin-1 হিসেবে পড়ে। এই টুল লেখা UTF-8 হিসেবে এনকোড ও ডিকোড করে, তাই বাংলা হুবহু ফেরত আসে।",
        },
      },
      {
        q: { en: "What is URL-safe Base64?", bn: "URL-safe Base64 কী?" },
        a: {
          en: "It uses - and _ instead of + and / and drops the = padding, so the result can go into a URL or file name. The decoder accepts both styles.",
          bn: "এতে + আর /-এর বদলে - আর _ ব্যবহার হয়, শেষের = বাদ যায়, ফলে URL বা ফাইলের নামে বসানো যায়। ডিকোড করার সময় দুই ধরনই চলে।",
        },
      },
      {
        q: { en: "Is Base64 encryption?", bn: "Base64 কি এনক্রিপশন?" },
        a: {
          en: "No. Base64 only changes how data is written, and anyone can decode it. Don't use it to hide passwords or secrets.",
          bn: "না। Base64 শুধু ডেটা লেখার ধরন বদলায়, যে কেউ ডিকোড করতে পারে। পাসওয়ার্ড বা গোপন তথ্য লুকাতে এটা ব্যবহার করবেন না।",
        },
      },
    ],
  },

  /* ---------- Utilities ---------- */

  "qr-code": {
    metaTitle: {
      en: "QR Code Generator for Links, Wi-Fi and Text, Free",
      bn: "QR কোড তৈরি করুন: লিংক, Wi-Fi, ফোন, ফ্রি",
    },
    metaDescription: {
      en: "Make a QR code for a link, text, Wi-Fi network, email or phone number, and download it as PNG or SVG. Free, no sign-up, no expiry, made on your device.",
      bn: "লিংক, লেখা, Wi-Fi, ইমেইল বা ফোন নম্বরের জন্য QR কোড বানান, PNG বা SVG হিসেবে ডাউনলোড করুন। ফ্রি, সাইন আপ ছাড়া, মেয়াদ শেষ হয় না, আপনার ডিভাইসেই তৈরি।",
    },
    intro: {
      en: "Create a QR code for your shop's Facebook page, a menu link, your Wi-Fi password or a phone number to call or text. The code contains your content directly, so it never expires and doesn't pass through a tracking link. Set colours, margin and error correction, then download a PNG or a print-ready SVG.",
      bn: "দোকানের ফেসবুক পেজ, মেনুর লিংক, Wi-Fi পাসওয়ার্ড বা কল ও SMS-এর জন্য ফোন নম্বরের QR কোড বানান। কোডের ভেতরে সরাসরি আপনার তথ্যই থাকে, তাই এর মেয়াদ শেষ হয় না, আর কোনো ট্র্যাকিং লিংকের মধ্য দিয়েও যায় না। রং, মার্জিন আর এরর কারেকশন ঠিক করে PNG বা প্রিন্টের উপযোগী SVG ডাউনলোড করুন।",
    },
    steps: [
      { en: "Pick what the code holds: Text / URL, Wi-Fi, Email or Phone.", bn: "QR-এ কী থাকবে বাছুন: লেখা / URL, Wi-Fi, ইমেইল বা ফোন।" },
      { en: "Fill in the details and watch the preview update.", bn: "তথ্যগুলো লিখুন, প্রিভিউ সঙ্গে সঙ্গে বদলাবে।" },
      { en: "Adjust the foreground, background, margin and error correction if you like.", bn: "চাইলে রং, ব্যাকগ্রাউন্ড, মার্জিন আর এরর কারেকশন বদলান।" },
      { en: "Download it as PNG or SVG.", bn: "PNG বা SVG হিসেবে ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "Do these QR codes expire?", bn: "এই QR কোডের কি মেয়াদ শেষ হয়?" },
        a: {
          en: "No. The link or text is stored inside the code itself, not on our server, so it keeps working as long as the content is valid.",
          bn: "না। লিংক বা লেখা কোডের ভেতরেই থাকে, আমাদের কোনো সার্ভারে না। তাই তথ্যটা ঠিক থাকলে কোডটা সবসময় কাজ করবে।",
        },
      },
      {
        q: { en: "How do I make a QR code for Wi-Fi?", bn: "Wi-Fi-এর QR কোড কীভাবে বানাব?" },
        a: {
          en: "Choose Wi-Fi, enter the network name (SSID), the password and the security type. Guests scan it with their phone camera to join without typing.",
          bn: "Wi-Fi বেছে নিয়ে নেটওয়ার্কের নাম (SSID), পাসওয়ার্ড আর সিকিউরিটির ধরন দিন। অতিথিরা ফোনের ক্যামেরায় স্ক্যান করলেই টাইপ না করে যুক্ত হতে পারবেন।",
        },
      },
      {
        q: { en: "PNG or SVG: which should I use for printing?", bn: "প্রিন্টের জন্য PNG নাকি SVG?" },
        a: {
          en: "SVG stays sharp at any size, so it is best for banners, flyers and packaging. PNG is fine for screens and social posts.",
          bn: "SVG যেকোনো মাপে ঝকঝকে থাকে, তাই ব্যানার, লিফলেট বা প্যাকেজিংয়ের জন্য সেটাই ভালো। স্ক্রিন আর সোশ্যাল পোস্টের জন্য PNG-ই যথেষ্ট।",
        },
      },
    ],
  },

  "create-zip": {
    metaTitle: {
      en: "Create ZIP File Online: Compress Files to ZIP",
      bn: "ZIP ফাইল তৈরি করুন অনলাইন, ফ্রি",
    },
    metaDescription: {
      en: "Put several files into one ZIP archive right in your browser, with a choice of compression level. Free, no sign-up, no watermark, and nothing is uploaded.",
      bn: "একাধিক ফাইল একটি ZIP ফাইলে ভরুন, সরাসরি ব্রাউজারেই, কম্প্রেশনের মাত্রা বেছে নিয়ে। ফ্রি, সাইন আপ বা ওয়াটারমার্ক ছাড়া, আর কোনো ফাইল আপলোড হয় না।",
    },
    intro: {
      en: "Bundle documents, photos or any other files into a single ZIP so they are easier to email or upload as one attachment. Choose Fast, Balanced, Smallest, or Store only for no compression. Everything is zipped on your device, so the files are never uploaded anywhere.",
      bn: "ডকুমেন্ট, ছবি বা যেকোনো ফাইল একটা ZIP-এ ভরে নিন, যাতে ইমেইলে বা এক অ্যাটাচমেন্টে আপলোড করতে সুবিধা হয়। দ্রুত, মাঝামাঝি, সবচেয়ে ছোট, অথবা কম্প্রেশন ছাড়া শুধু জমা রাখা, যেকোনোটা বাছুন। সব কাজ আপনার ডিভাইসেই হয়, ফাইল কোথাও আপলোড হয় না।",
    },
    steps: [
      { en: "Choose or drop the files you want to zip.", bn: "যে ফাইলগুলো ZIP করবেন, বেছে নিন বা টেনে আনুন।" },
      { en: "Set the ZIP file name and the compression level.", bn: "ZIP ফাইলের নাম আর কম্প্রেশনের মাত্রা ঠিক করুন।" },
      { en: "Click Create ZIP.", bn: "ZIP তৈরি শুরু করুন।" },
      { en: "Click Download ZIP.", bn: "ZIP ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "Why didn't my ZIP get much smaller?", bn: "ZIP করার পরও সাইজ তেমন কমল না কেন?" },
        a: {
          en: "Photos, videos and PDFs are already compressed, so zipping them barely shrinks them. Text, CSV and Word files usually shrink a lot more.",
          bn: "ছবি, ভিডিও আর PDF আগে থেকেই কম্প্রেস করা থাকে, তাই ZIP করলে খুব একটা ছোট হয় না। লেখা, CSV বা Word ফাইল সাধারণত অনেক বেশি ছোট হয়।",
        },
      },
      {
        q: { en: "Can I password-protect the ZIP?", bn: "ZIP ফাইলে কি পাসওয়ার্ড দেওয়া যায়?" },
        a: {
          en: "No, this tool creates standard ZIP files without encryption. Use 7-Zip or a similar app if you need a password.",
          bn: "না, এই টুল এনক্রিপশন ছাড়া সাধারণ ZIP ফাইল বানায়। পাসওয়ার্ড লাগলে 7-Zip বা এ ধরনের অ্যাপ ব্যবহার করুন।",
        },
      },
      {
        q: { en: "Will the ZIP open on Windows and Mac?", bn: "ZIP কি Windows আর Mac-এ খুলবে?" },
        a: {
          en: "Yes. It is a standard ZIP file that opens with the built-in tools on Windows, macOS, Android and iPhone.",
          bn: "হ্যাঁ। এটা সাধারণ ZIP ফাইল, Windows, macOS, Android আর iPhone-এর নিজস্ব টুল দিয়েই খোলা যায়।",
        },
      },
    ],
  },

  unzip: {
    metaTitle: {
      en: "Unzip Files Online: Open a ZIP Without Software",
      bn: "ZIP ফাইল খুলুন অনলাইন, সফটওয়্যার ছাড়াই",
    },
    metaDescription: {
      en: "Open a ZIP file in your browser, preview what's inside, and download single files or all of them. Free, no app to install, and the archive is never uploaded.",
      bn: "ব্রাউজারেই ZIP ফাইল খুলুন, ভেতরে কী আছে দেখুন, আর একটা একটা বা সব ফাইল ডাউনলোড করুন। ফ্রি, কোনো অ্যাপ ইনস্টল লাগে না, আর ফাইল কোথাও আপলোড হয় না।",
    },
    intro: {
      en: "Look inside a ZIP and take out the files you need, on a computer or phone without installing anything. See the file list with sizes, preview files, and download one at a time or everything at once. In Chrome and Edge you can also extract everything straight into a folder you choose.",
      bn: "কিছু ইনস্টল না করেই কম্পিউটার বা ফোনে ZIP ফাইলের ভেতরে দেখুন আর দরকারি ফাইলগুলো বের করে নিন। সাইজসহ ফাইলের তালিকা দেখুন, প্রিভিউ করুন, আর একটা একটা করে বা সব একসাথে ডাউনলোড করুন। Chrome আর Edge-এ চাইলে সব ফাইল সরাসরি আপনার বাছাই করা ফোল্ডারেও রাখা যায়।",
    },
    steps: [
      { en: "Open a .zip file.", bn: "একটি .zip ফাইল খুলুন।" },
      { en: "Browse the contents and preview any file.", bn: "ভেতরের ফাইলগুলো দেখুন, যেকোনোটা প্রিভিউ করুন।" },
      { en: "Click Download next to a file, or Download all.", bn: "ফাইলের পাশে ডাউনলোড চাপুন, অথবা সব ডাউনলোড করুন।" },
      { en: "Or choose Extract all to a folder, where your browser supports it.", bn: "ব্রাউজার সাপোর্ট করলে সব ফাইল একটা ফোল্ডারে বের করার অপশনও বেছে নিতে পারেন।" },
    ],
    faqs: [
      {
        q: { en: "Can I open a password-protected ZIP?", bn: "পাসওয়ার্ড দেওয়া ZIP কি খোলা যায়?" },
        a: {
          en: "No. Encrypted archives can't be opened in the browser; use 7-Zip or your system's unzip tool instead.",
          bn: "না। এনক্রিপ্ট করা ZIP ব্রাউজারে খোলা যায় না, এর জন্য 7-Zip বা কম্পিউটারের নিজস্ব আনজিপ টুল ব্যবহার করুন।",
        },
      },
      {
        q: { en: "Does it open RAR or 7z files?", bn: "RAR বা 7z ফাইল কি খোলে?" },
        a: {
          en: "No, only ZIP files using the standard Deflate or Store methods. For RAR and 7z, use a desktop app like 7-Zip.",
          bn: "না, শুধু সাধারণ Deflate বা Store পদ্ধতির ZIP ফাইল খোলে। RAR আর 7z-এর জন্য 7-Zip-এর মতো ডেস্কটপ অ্যাপ লাগবে।",
        },
      },
      {
        q: { en: "How do I unzip a file on my phone?", bn: "ফোনে ZIP ফাইল কীভাবে খুলব?" },
        a: {
          en: "Open this page in your phone's browser, choose the ZIP from your downloads, and tap Download next to the files you need.",
          bn: "ফোনের ব্রাউজারে এই পেজটা খুলুন, ডাউনলোড থেকে ZIP ফাইলটা বেছে নিন, তারপর দরকারি ফাইলের পাশে ডাউনলোড চাপুন।",
        },
      },
    ],
  },

  "hash-generator": {
    metaTitle: {
      en: "SHA-256 Hash Generator for Text and Files",
      bn: "হ্যাশ জেনারেটর: SHA-256, SHA-1, SHA-512",
    },
    metaDescription: {
      en: "Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes of text or any file, and verify a download against a known checksum. Free; files are hashed locally.",
      bn: "লেখা বা যেকোনো ফাইলের SHA-1, SHA-256, SHA-384 ও SHA-512 হ্যাশ বের করুন, আর ডাউনলোড করা ফাইল চেকসামের সাথে মিলিয়ে নিন। ফ্রি, ফাইল ডিভাইসেই হ্যাশ হয়।",
    },
    intro: {
      en: "Calculate a checksum to confirm a downloaded file wasn't changed or corrupted, or hash text for development work. All four SHA hashes appear together, and you can paste an expected hash to check for a match. MD5 isn't offered, because browsers don't support it and it's no longer safe for integrity checks.",
      bn: "ডাউনলোড করা ফাইল বদলে গেছে বা নষ্ট হয়েছে কি না যাচাই করতে চেকসাম বের করুন, অথবা ডেভেলপমেন্টের কাজে লেখার হ্যাশ নিন। চারটি SHA হ্যাশ একসাথে দেখায়, আর জানা হ্যাশ পেস্ট করে মিলছে কি না দেখতে পারেন। MD5 রাখা হয়নি, কারণ ব্রাউজার এটা সাপোর্ট করে না, আর যাচাইয়ের কাজে এটা এখন নিরাপদও নয়।",
    },
    steps: [
      { en: "Choose Text or File as the input.", bn: "ইনপুট হিসেবে লেখা বা ফাইল বেছে নিন।" },
      { en: "Type the text or choose the file.", bn: "লেখা টাইপ করুন বা ফাইল বেছে নিন।" },
      { en: "Copy the SHA-1, SHA-256, SHA-384 or SHA-512 value you need.", bn: "দরকারি SHA-1, SHA-256, SHA-384 বা SHA-512 মান কপি করুন।" },
      { en: "To verify, paste the expected hash under Compare with a known hash.", bn: "যাচাই করতে জানা হ্যাশটা তুলনার ঘরে পেস্ট করুন।" },
    ],
    faqs: [
      {
        q: { en: "How do I check a file's SHA-256 checksum?", bn: "ফাইলের SHA-256 চেকসাম কীভাবে যাচাই করব?" },
        a: {
          en: "Choose the file, then paste the checksum from the download page into the compare box. It tells you whether it matches and which algorithm it is.",
          bn: "ফাইলটা বেছে নিন, তারপর ডাউনলোড পেজে দেওয়া চেকসাম তুলনার ঘরে পেস্ট করুন। মিলল কি না, আর কোন অ্যালগরিদমের হ্যাশ, তা দেখিয়ে দেবে।",
        },
      },
      {
        q: { en: "Why is there no MD5?", bn: "MD5 নেই কেন?" },
        a: {
          en: "Browsers' built-in crypto doesn't include MD5, and MD5 is broken for security use. Use SHA-256 wherever you can.",
          bn: "ব্রাউজারের নিজস্ব ক্রিপ্টোতে MD5 নেই, আর নিরাপত্তার কাজে MD5 এখন ভাঙা। যেখানে সম্ভব SHA-256 ব্যবহার করুন।",
        },
      },
      {
        q: { en: "Are large files uploaded to be hashed?", bn: "বড় ফাইল কি হ্যাশ করতে আপলোড হয়?" },
        a: {
          en: "No. The file is read and hashed on your device, so even private files stay with you.",
          bn: "না। ফাইলটা আপনার ডিভাইসেই পড়া ও হ্যাশ করা হয়, তাই ব্যক্তিগত ফাইলও আপনার কাছেই থাকে।",
        },
      },
    ],
  },

  "password-generator": {
    metaTitle: {
      en: "Strong Password Generator and Passphrase Maker",
      bn: "শক্তিশালী পাসওয়ার্ড জেনারেটর, ফ্রি",
    },
    metaDescription: {
      en: "Generate strong random passwords or easy-to-type passphrases with your browser's secure random generator. Free, with nothing sent or stored anywhere.",
      bn: "ব্রাউজারের নিরাপদ র‍্যান্ডম জেনারেটর দিয়ে শক্তিশালী পাসওয়ার্ড বা সহজে টাইপ করা যায় এমন পাসফ্রেজ বানান। ফ্রি, আর কোনো কিছু কোথাও পাঠানো বা জমা রাখা হয় না।",
    },
    intro: {
      en: "Make a password for email, bKash, banking or Wi-Fi that nobody will guess. Choose length and character types, or switch to a passphrase of common English words that is easier to type and remember. Passwords are made on your device with a secure random generator and are never sent or saved.",
      bn: "ইমেইল, বিকাশ, ব্যাংকিং বা Wi-Fi-এর জন্য এমন পাসওয়ার্ড বানান যা কেউ আন্দাজ করতে পারবে না। দৈর্ঘ্য আর অক্ষরের ধরন বেছে নিন, অথবা সাধারণ ইংরেজি শব্দ দিয়ে পাসফ্রেজ বানান, যা টাইপ করা আর মনে রাখা সহজ। পাসওয়ার্ড আপনার ডিভাইসেই নিরাপদ র‍্যান্ডম জেনারেটর দিয়ে তৈরি হয়, কোথাও পাঠানো বা সেভ করা হয় না।",
    },
    steps: [
      { en: "Choose Password or Passphrase.", bn: "পাসওয়ার্ড নাকি পাসফ্রেজ, বেছে নিন।" },
      { en: "Set the length and tick Uppercase, Lowercase, Numbers or Symbols.", bn: "দৈর্ঘ্য ঠিক করুন, আর বড় হাতের, ছোট হাতের, সংখ্যা বা চিহ্ন বেছে নিন।" },
      { en: "Check the strength meter and click Generate new for another one.", bn: "শক্তির মাপটা দেখুন, আরেকটা চাইলে নতুন করে তৈরি করুন।" },
      { en: "Copy the password into your password manager.", bn: "পাসওয়ার্ডটা কপি করে আপনার পাসওয়ার্ড ম্যানেজারে রাখুন।" },
    ],
    faqs: [
      {
        q: { en: "How long should a strong password be?", bn: "শক্তিশালী পাসওয়ার্ড কত বড় হওয়া উচিত?" },
        a: {
          en: "At least 16 characters with mixed types is a good target for important accounts. The strength meter shows the bits of entropy so you can see the difference.",
          bn: "গুরুত্বপূর্ণ অ্যাকাউন্টের জন্য কমপক্ষে ১৬ অক্ষর, নানা ধরনের অক্ষর মিলিয়ে, ভালো লক্ষ্য। শক্তির মাপে এনট্রপি বিট দেখায়, তাই পার্থক্যটা বুঝতে পারবেন।",
        },
      },
      {
        q: { en: "Is it safe to generate passwords online?", bn: "অনলাইনে পাসওয়ার্ড বানানো কি নিরাপদ?" },
        a: {
          en: "Here, yes: passwords are created by your browser's secure random generator on your device and are never sent or stored. You can even disconnect from the internet after the page loads.",
          bn: "এখানে নিরাপদ। পাসওয়ার্ড আপনার ডিভাইসে ব্রাউজারের নিরাপদ র‍্যান্ডম জেনারেটর দিয়ে তৈরি হয়, কোথাও পাঠানো বা জমা রাখা হয় না। পেজ লোড হওয়ার পর ইন্টারনেট বন্ধ করেও ব্যবহার করতে পারেন।",
        },
      },
      {
        q: { en: "What does Avoid look-alikes do?", bn: "একরকম দেখতে অক্ষর বাদ দেওয়ার অপশনটা কী করে?" },
        a: {
          en: "It leaves out characters that are easy to confuse, such as O and 0 or l and 1, which helps when you have to read or type the password by hand.",
          bn: "O আর 0, বা l আর 1-এর মতো সহজে গুলিয়ে ফেলা অক্ষর বাদ দেয়। পাসওয়ার্ড দেখে দেখে হাতে টাইপ করতে হলে এটা কাজে লাগে।",
        },
      },
    ],
  },

  "epoch-converter": {
    metaTitle: {
      en: "Epoch Converter: Unix Timestamp to Date and Back",
      bn: "ইপক কনভার্টার: Unix টাইমস্ট্যাম্প থেকে তারিখ",
    },
    metaDescription: {
      en: "Convert Unix timestamps in seconds, milliseconds, microseconds or nanoseconds to a readable date in UTC or local time, and back. Free, instant and private.",
      bn: "সেকেন্ড, মিলিসেকেন্ড, মাইক্রো বা ন্যানোসেকেন্ডের Unix টাইমস্ট্যাম্পকে UTC বা স্থানীয় সময়ের তারিখে আনুন, আবার উল্টোটাও। ফ্রি, সঙ্গে সঙ্গে, পুরোপুরি গোপন।",
    },
    intro: {
      en: "Read the timestamps in logs, databases and API responses as real dates, or turn a date into a timestamp. Auto mode reads 10-digit values as seconds and 13-digit values as milliseconds. Results show in UTC and your own time zone, such as Bangladesh time (UTC+6), along with how long ago it was.",
      bn: "লগ, ডেটাবেস বা API রেসপন্সের টাইমস্ট্যাম্পকে আসল তারিখ হিসেবে পড়ুন, অথবা তারিখ থেকে টাইমস্ট্যাম্প বানান। অটো মোডে ১০ অঙ্কের মান সেকেন্ড আর ১৩ অঙ্কের মান মিলিসেকেন্ড ধরা হয়। ফলাফল UTC আর আপনার নিজের টাইম জোনে দেখায়, যেমন বাংলাদেশ সময় (UTC+6), সঙ্গে কতক্ষণ আগে তাও।",
    },
    steps: [
      { en: "Paste a Unix timestamp under Timestamp → date.", bn: "টাইমস্ট্যাম্প থেকে তারিখের ঘরে একটা Unix টাইমস্ট্যাম্প পেস্ট করুন।" },
      { en: "Leave the unit on Auto or pick seconds, milliseconds, micros or nanos.", bn: "একক অটো রাখুন, অথবা সেকেন্ড, মিলি, মাইক্রো বা ন্যানো বেছে নিন।" },
      { en: "Read the date in UTC, local time and relative time.", bn: "UTC, স্থানীয় সময় আর কতক্ষণ আগে, তিনভাবেই তারিখ দেখুন।" },
      { en: "To go the other way, pick a date and time under Date → timestamp and copy the seconds or ms.", bn: "উল্টো করতে তারিখ থেকে টাইমস্ট্যাম্পের ঘরে তারিখ-সময় বাছুন, তারপর সেকেন্ড বা মিলিসেকেন্ড কপি করুন।" },
    ],
    faqs: [
      {
        q: { en: "What is a Unix timestamp?", bn: "Unix টাইমস্ট্যাম্প কী?" },
        a: {
          en: "It is the number of seconds since 1 January 1970, 00:00 UTC. Many systems use milliseconds instead, which is why some timestamps have 13 digits.",
          bn: "১ জানুয়ারি ১৯৭০, রাত ১২টা (UTC) থেকে পার হওয়া সেকেন্ডের সংখ্যাই Unix টাইমস্ট্যাম্প। অনেক সিস্টেম সেকেন্ডের বদলে মিলিসেকেন্ড ব্যবহার করে, তাই কিছু টাইমস্ট্যাম্প ১৩ অঙ্কের হয়।",
        },
      },
      {
        q: { en: "How do I convert a timestamp to Bangladesh time?", bn: "টাইমস্ট্যাম্পকে বাংলাদেশ সময়ে কীভাবে আনব?" },
        a: {
          en: "Paste it in; the local time row uses your device's time zone, which in Bangladesh is UTC+6. You can also switch the date input between Local and UTC.",
          bn: "টাইমস্ট্যাম্পটা পেস্ট করুন। স্থানীয় সময়ের সারিতে আপনার ডিভাইসের টাইম জোন ব্যবহার হয়, বাংলাদেশে যা UTC+6। তারিখ দেওয়ার সময় স্থানীয় আর UTC-এর মধ্যেও বদলাতে পারেন।",
        },
      },
      {
        q: { en: "How do I get the current epoch time?", bn: "এখনকার ইপক সময় কীভাবে পাব?" },
        a: {
          en: "The current Unix time is shown at the top and ticks live. Click Copy seconds or Copy ms to grab it.",
          bn: "ওপরে বর্তমান Unix সময় দেখায়, যা চলতেই থাকে। সেকেন্ড বা মিলিসেকেন্ড কপি করার বোতাম চাপলেই নিয়ে নিতে পারবেন।",
        },
      },
    ],
  },

  "lorem-ipsum": {
    metaTitle: {
      en: "Lorem Ipsum Generator in English and Bangla",
      bn: "বাংলা ডামি লেখা ও Lorem Ipsum জেনারেটর",
    },
    metaDescription: {
      en: "Generate lorem ipsum or Bangla placeholder text by paragraphs, sentences or words, with optional <p> tags. Free, instant, and nothing to sign up for.",
      bn: "অনুচ্ছেদ, বাক্য বা শব্দ ধরে Lorem Ipsum কিংবা বাংলা ডামি লেখা তৈরি করুন, চাইলে <p> ট্যাগসহ। ফ্রি, সঙ্গে সঙ্গে, আর কোনো সাইন আপ লাগে না।",
    },
    intro: {
      en: "Fill a design, website mockup or print layout with placeholder text in English or Bangla. The Bangla dummy text is built from everyday words, so you see real Bangla line heights, conjuncts and word lengths instead of guessing. Choose paragraphs, sentences or words, and wrap paragraphs in <p> tags for HTML.",
      bn: "ডিজাইন, ওয়েবসাইটের মকআপ বা প্রিন্ট লেআউট ইংরেজি বা বাংলা নমুনা লেখা দিয়ে ভরুন। বাংলা ডামি লেখা রোজকার শব্দ দিয়ে তৈরি, তাই আন্দাজ না করে আসল বাংলার লাইনের উচ্চতা, যুক্তাক্ষর আর শব্দের দৈর্ঘ্য দেখতে পাবেন। অনুচ্ছেদ, বাক্য বা শব্দ বেছে নিন, HTML-এর জন্য অনুচ্ছেদ <p> ট্যাগে মুড়ে নিন।",
    },
    steps: [
      { en: "Pick the language: English or Bangla.", bn: "ভাষা বাছুন: ইংরেজি বা বাংলা।" },
      { en: "Choose Paragraphs, Sentences or Words and set How many.", bn: "অনুচ্ছেদ, বাক্য বা শব্দ বাছুন, আর কয়টা লাগবে ঠিক করুন।" },
      { en: "Tick Wrap paragraphs in <p> tags if you need HTML.", bn: "HTML লাগলে অনুচ্ছেদ <p> ট্যাগে মোড়ার অপশন চালু করুন।" },
      { en: "Copy the text or click Download.", bn: "লেখা কপি করুন বা ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "Is there a Bangla lorem ipsum?", bn: "বাংলায় কি Lorem Ipsum আছে?" },
        a: {
          en: "Yes. Switch the language to Bangla to get placeholder text built from common Bangla words, which shows how real Bangla will look in your layout.",
          bn: "হ্যাঁ। ভাষা বাংলা করে দিলেই সাধারণ বাংলা শব্দ দিয়ে তৈরি নমুনা লেখা পাবেন, যাতে বোঝা যায় আসল বাংলা লেখা লেআউটে কেমন দেখাবে।",
        },
      },
      {
        q: { en: "What does lorem ipsum mean?", bn: "Lorem Ipsum মানে কী?" },
        a: {
          en: "It is scrambled Latin taken from a text by Cicero, used since the days of print so readers focus on the layout rather than the words.",
          bn: "এটা সিসেরোর একটা লেখা থেকে নেওয়া এলোমেলো ল্যাটিন। ছাপাখানার যুগ থেকে এটা ব্যবহার হচ্ছে, যাতে পাঠক লেখার বদলে লেআউটে মনোযোগ দেন।",
        },
      },
      {
        q: { en: "Can I start with the classic “Lorem ipsum dolor sit amet”?", bn: "শুরুতে কি চিরচেনা “Lorem ipsum dolor sit amet” রাখা যায়?" },
        a: {
          en: "Yes. For English, tick the option to start with “Lorem ipsum dolor sit amet…”.",
          bn: "হ্যাঁ। ইংরেজির ক্ষেত্রে “Lorem ipsum dolor sit amet…” দিয়ে শুরু করার অপশনটা চালু করুন।",
        },
      },
    ],
  },
};
