import type { ToolContent } from "./types";

// Search-facing copy for the PDF tools. Every claim here must match the tool UI in src/tools/impl/<slug>.tsx.

export const PDF_CONTENT: Record<string, ToolContent> = {
  "merge-pdf": {
    metaTitle: {
      en: "Merge PDF Online Free, No Upload Needed",
      bn: "PDF মার্জ করুন অনলাইনে ফ্রি, আপলোড ছাড়াই",
    },
    metaDescription: {
      en: "Combine two or more PDFs into one file, in the order you set. Free, no sign-up, no watermark. Files are merged in your browser and never leave your device.",
      bn: "দুই বা তার বেশি PDF আপনার পছন্দের ক্রমে এক ফাইলে জুড়ুন। সম্পূর্ণ ফ্রি, সাইন-আপ বা ওয়াটারমার্ক নেই। ফাইল ব্রাউজারেই জোড়া হয়, আপনার ডিভাইসের বাইরে যায় না।",
    },
    intro: {
      en: "Add your PDFs, put them in the right order with the up and down arrows, and download a single merged file. Everything happens in your browser, so contracts, certificates and bank statements stay on your own device.",
      bn: "PDF ফাইলগুলো দিন, ওপর-নিচ তীর দিয়ে ক্রম ঠিক করুন, তারপর একটি ফাইল হিসেবে ডাউনলোড করুন। পুরো কাজ আপনার ব্রাউজারেই হয়, তাই চুক্তিপত্র, সার্টিফিকেট বা ব্যাংক স্টেটমেন্ট কোথাও আপলোড হয় না।",
    },
    steps: [
      { en: "Drop two or more PDF files, or click to choose them.", bn: "দুই বা তার বেশি PDF ফাইল টেনে আনুন, অথবা ক্লিক করে বাছাই করুন।" },
      { en: "Use the ↑ and ↓ buttons to set the order. Files are joined top to bottom.", bn: "↑ আর ↓ বাটন দিয়ে ক্রম ঠিক করুন। ফাইলগুলো ওপর থেকে নিচের ক্রমে জোড়া হবে।" },
      { en: "Click Merge PDFs.", bn: "“PDF একত্র করুন” বাটনে ক্লিক করুন।" },
      { en: "Click Download PDF to save merged.pdf.", bn: "“PDF ডাউনলোড করুন” চেপে merged.pdf সেভ করুন।" },
    ],
    faqs: [
      {
        q: { en: "Is it safe to merge PDFs online?", bn: "অনলাইনে PDF জোড়া লাগানো কি নিরাপদ?" },
        a: {
          en: "Here it is, because nothing is uploaded. The merge runs inside your browser, so your files never reach a server.",
          bn: "এখানে নিরাপদ, কারণ কিছুই আপলোড হয় না। জোড়ার কাজ আপনার ব্রাউজারের ভেতরেই হয়, ফাইল কোনো সার্ভারে যায় না।",
        },
      },
      {
        q: { en: "Can I merge password-protected PDFs?", bn: "পাসওয়ার্ড দেওয়া PDF কি জোড়া যাবে?" },
        a: {
          en: "No. Encrypted PDFs can't be read by the tool, so remove the password first and then add the unlocked file.",
          bn: "না। এনক্রিপ্ট করা PDF টুলটি পড়তে পারে না। আগে পাসওয়ার্ড সরিয়ে আনলক করা ফাইলটি দিন।",
        },
      },
      {
        q: { en: "Is there a limit on how many PDFs I can merge?", bn: "কয়টি PDF একসাথে জোড়া যাবে, কোনো সীমা আছে?" },
        a: {
          en: "There is no set limit. Very large batches depend on your device's memory, so a phone may slow down sooner than a computer.",
          bn: "নির্দিষ্ট কোনো সীমা নেই। তবে খুব বেশি বা খুব বড় ফাইল হলে তা আপনার ডিভাইসের মেমোরির ওপর নির্ভর করে, মোবাইলে কম্পিউটারের চেয়ে আগে ধীর হতে পারে।",
        },
      },
    ],
  },

  "split-pdf": {
    metaTitle: {
      en: "Split PDF Online Free: By Range or Every Page",
      bn: "PDF স্প্লিট করুন অনলাইনে, পেজ ধরে ভাগ",
    },
    metaDescription: {
      en: "Split a PDF by page ranges, into single pages, or into parts of N pages each. Free, no watermark, and private: the file is processed on your own device.",
      bn: "পৃষ্ঠার রেঞ্জ ধরে, প্রতিটি পৃষ্ঠা আলাদা করে, বা প্রতি N পৃষ্ঠায় PDF ভাগ করুন। ফ্রি, কোনো ওয়াটারমার্ক নেই। ফাইল আপনার ডিভাইসেই প্রসেস হয়, আপলোড হয় না।",
    },
    intro: {
      en: "Cut one PDF into several smaller ones. Type ranges like 1-3, 4-6 to get one file per range, save every page as its own PDF, or split into equal parts of a set size. When there is more than one file, you get them together in a ZIP.",
      bn: "একটি PDF থেকে কয়েকটি ছোট PDF বানান। 1-3, 4-6 এভাবে রেঞ্জ লিখলে প্রতিটি রেঞ্জ আলাদা ফাইল হবে, চাইলে প্রতিটি পৃষ্ঠা আলাদা PDF করুন, অথবা নির্দিষ্ট পৃষ্ঠা ধরে সমান ভাগ করুন। একাধিক ফাইল হলে সব একসাথে ZIP-এ পাবেন।",
    },
    steps: [
      { en: "Drop the PDF you want to split.", bn: "যে PDF ভাগ করবেন সেটি এখানে দিন।" },
      { en: "Pick a split mode: Ranges, Every page, or Every N.", bn: "ভাগের ধরন বাছুন: সীমা, প্রতি পৃষ্ঠা, বা প্রতি N পৃষ্ঠা।" },
      { en: "Type your ranges or the number of pages per file, then check the preview list.", bn: "পৃষ্ঠার সীমা বা প্রতি ফাইলে কয় পৃষ্ঠা থাকবে লিখুন, তারপর তালিকায় মিলিয়ে নিন।" },
      { en: "Click Split PDF and download the PDF or ZIP.", bn: "“PDF ভাগ করুন” চাপুন, তারপর PDF বা ZIP ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "How do I split a PDF into separate pages?", bn: "PDF-এর প্রতিটি পৃষ্ঠা আলাদা ফাইল করব কীভাবে?" },
        a: {
          en: "Choose the Every page mode and click Split PDF. Each page is saved as its own PDF and all of them download in one ZIP.",
          bn: "“প্রতি পৃষ্ঠা” অপশন বেছে “PDF ভাগ করুন” চাপুন। প্রতিটি পৃষ্ঠা আলাদা PDF হবে, আর সবগুলো একটি ZIP ফাইলে ডাউনলোড হবে।",
        },
      },
      {
        q: { en: "Does splitting reduce the quality of my PDF?", bn: "ভাগ করলে কি PDF-এর মান কমে যায়?" },
        a: {
          en: "No. Pages are copied as they are, so text, images and fonts stay exactly the same.",
          bn: "না। পৃষ্ঠাগুলো হুবহু কপি হয়, তাই লেখা, ছবি আর ফন্ট আগের মতোই থাকে।",
        },
      },
      {
        q: { en: "Can I split a password-protected PDF?", bn: "পাসওয়ার্ড দেওয়া PDF কি ভাগ করা যাবে?" },
        a: {
          en: "Not directly. Encrypted PDFs need to be unlocked first, then you can split the unlocked copy here.",
          bn: "সরাসরি না। এনক্রিপ্ট করা PDF আগে আনলক করতে হবে, তারপর সেই কপিটি এখানে ভাগ করতে পারবেন।",
        },
      },
    ],
  },

  "remove-pages": {
    metaTitle: {
      en: "Delete Pages from PDF Online, Free & Private",
      bn: "PDF থেকে পেজ ডিলিট করুন অনলাইনে ফ্রি",
    },
    metaDescription: {
      en: "Delete unwanted pages from a PDF by clicking their thumbnails or typing page numbers. Free, no sign-up, and your file stays on your device the whole time.",
      bn: "থাম্বনেইলে ক্লিক করে বা পৃষ্ঠা নম্বর লিখে PDF থেকে অপ্রয়োজনীয় পেজ মুছে ফেলুন। ফ্রি, সাইন-আপ লাগে না, আর ফাইল সবসময় আপনার ডিভাইসেই থাকে।",
    },
    intro: {
      en: "See every page as a thumbnail, click the ones you don't need, and save a trimmed copy. You can also type pages like 2, 5-7 or use the Odd, Even and Invert shortcuts to mark many pages at once.",
      bn: "প্রতিটি পৃষ্ঠা ছোট ছবিতে দেখুন, যেগুলো লাগবে না সেগুলোতে ক্লিক করুন, তারপর ছাঁটা কপি সেভ করুন। চাইলে 2, 5-7 এভাবে লিখে, অথবা বিজোড়, জোড় আর উল্টে দিন বাটন দিয়ে একসাথে অনেক পৃষ্ঠা বাছতে পারেন।",
    },
    steps: [
      { en: "Drop your PDF to load page thumbnails.", bn: "PDF দিন, পৃষ্ঠাগুলোর থাম্বনেইল দেখা যাবে।" },
      { en: "Click the pages you want gone, or type them in the Pages to remove box.", bn: "যে পৃষ্ঠাগুলো বাদ দেবেন সেগুলোতে ক্লিক করুন, অথবা “যে পৃষ্ঠাগুলো মুছবেন” ঘরে নম্বর লিখুন।" },
      { en: "Click Remove pages.", bn: "“পৃষ্ঠা মুছুন” বাটনে ক্লিক করুন।" },
      { en: "Click Download PDF to save the trimmed file.", bn: "“PDF ডাউনলোড করুন” চেপে নতুন ফাইলটি সেভ করুন।" },
    ],
    faqs: [
      {
        q: { en: "How do I delete a page from a PDF without Adobe Acrobat?", bn: "Adobe Acrobat ছাড়া PDF-এর পেজ মুছব কীভাবে?" },
        a: {
          en: "Open this tool in any browser, click the page you want to delete and press Remove pages. No software or account is needed.",
          bn: "যেকোনো ব্রাউজারে এই টুলটি খুলুন, যে পৃষ্ঠা মুছবেন সেটিতে ক্লিক করে “পৃষ্ঠা মুছুন” চাপুন। কোনো সফটওয়্যার বা অ্যাকাউন্ট লাগে না।",
        },
      },
      {
        q: { en: "Can I remove every page?", bn: "সব পৃষ্ঠা কি মুছে ফেলা যায়?" },
        a: {
          en: "No. A PDF needs at least one page, so the tool asks you to keep at least one.",
          bn: "না। একটি PDF-এ অন্তত একটি পৃষ্ঠা থাকতে হয়, তাই টুলটি অন্তত একটি পৃষ্ঠা রাখতে বলবে।",
        },
      },
      {
        q: { en: "Is my original PDF changed?", bn: "আমার আসল PDF কি বদলে যাবে?" },
        a: {
          en: "No. Your original file is left as it is, and you download a new copy with the pages removed.",
          bn: "না। আসল ফাইল যেমন ছিল তেমনই থাকে, পৃষ্ঠা বাদ দেওয়া একটি নতুন কপি ডাউনলোড হয়।",
        },
      },
    ],
  },

  "extract-pages": {
    metaTitle: {
      en: "Extract Pages from PDF, Free Online Tool",
      bn: "PDF থেকে পেজ আলাদা করুন, ফ্রি অনলাইন টুল",
    },
    metaDescription: {
      en: "Pick the pages you need and save them as a new PDF, or one PDF per page. Free and private: pages are pulled out in your browser, nothing is uploaded.",
      bn: "দরকারি পৃষ্ঠাগুলো বেছে নতুন একটি PDF বানান, বা প্রতিটি পৃষ্ঠা আলাদা PDF করুন। ফ্রি আর নিরাপদ, কাজ হয় ব্রাউজারেই, কোনো ফাইল আপলোড হয় না।",
    },
    intro: {
      en: "Need only a few pages from a long document, like the result sheet from a full report? Click those pages, then save them as one PDF or as separate files bundled in a ZIP.",
      bn: "লম্বা ডকুমেন্ট থেকে শুধু কয়েকটা পৃষ্ঠা দরকার, যেমন পুরো রিপোর্ট থেকে রেজাল্ট শিটটুকু? সেই পৃষ্ঠাগুলোতে ক্লিক করুন, তারপর একটি PDF হিসেবে বা আলাদা আলাদা ফাইল করে ZIP-এ সেভ করুন।",
    },
    steps: [
      { en: "Drop your PDF to see its pages.", bn: "PDF দিন, পৃষ্ঠাগুলো দেখা যাবে।" },
      { en: "Click the pages to keep, or type them like 2, 5-7.", bn: "যে পৃষ্ঠাগুলো রাখবেন সেগুলোতে ক্লিক করুন, অথবা 2, 5-7 এভাবে লিখুন।" },
      { en: "Under Output, choose One PDF or PDF per page.", bn: "আউটপুট থেকে “একটি PDF” বা “প্রতি পৃষ্ঠায় PDF” বাছুন।" },
      { en: "Click Extract pages, then download the PDF or ZIP.", bn: "“পৃষ্ঠা আলাদা করুন” চাপুন, তারপর PDF বা ZIP ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "What is the difference between extract pages and split PDF?", bn: "পৃষ্ঠা আলাদা করা আর PDF ভাগ করার মধ্যে পার্থক্য কী?" },
        a: {
          en: "Extract lets you hand-pick any pages and save just those. Split cuts the whole document into parts by ranges or page counts.",
          bn: "আলাদা করার টুলে আপনি নিজের পছন্দমতো পৃষ্ঠা বেছে শুধু সেগুলো সেভ করেন। ভাগ করার টুল পুরো ডকুমেন্টকে রেঞ্জ বা পৃষ্ঠা সংখ্যা ধরে কয়েক ভাগে কাটে।",
        },
      },
      {
        q: { en: "In what order are the extracted pages saved?", bn: "আলাদা করা পৃষ্ঠাগুলো কোন ক্রমে সেভ হয়?" },
        a: {
          en: "They keep their original order from the source PDF. To change the order, use Organize PDF on the result.",
          bn: "মূল PDF-এ যে ক্রমে ছিল সেভাবেই থাকে। ক্রম বদলাতে চাইলে নতুন ফাইলটি “PDF সাজান” টুলে খুলুন।",
        },
      },
      {
        q: { en: "Can I extract pages on my phone?", bn: "মোবাইল থেকে কি পৃষ্ঠা আলাদা করা যাবে?" },
        a: {
          en: "Yes. The tool works in mobile browsers such as Chrome and Safari, and the file still never leaves your phone.",
          bn: "হ্যাঁ। Chrome বা Safari-র মতো মোবাইল ব্রাউজারে টুলটি চলে, আর ফাইল আপনার ফোনের বাইরে যায় না।",
        },
      },
    ],
  },

  "organize-pdf": {
    metaTitle: {
      en: "Rearrange PDF Pages Online: Reorder, Rotate, Delete",
      bn: "PDF পেজ সাজান অনলাইনে, ক্রম বদলান ও ঘোরান",
    },
    metaDescription: {
      en: "Drag PDF pages into a new order, rotate single pages, delete extras and save. Free, no account, no watermark. Your PDF is edited locally and never uploaded.",
      bn: "PDF-এর পৃষ্ঠা টেনে নতুন ক্রমে সাজান, আলাদা করে ঘোরান, বাড়তি পৃষ্ঠা মুছে সেভ করুন। ফ্রি, অ্যাকাউন্ট বা ওয়াটারমার্ক নেই। PDF আপনার ডিভাইসেই এডিট হয়, আপলোড হয় না।",
    },
    intro: {
      en: "Fix a scan that came out in the wrong order or with a sideways page. Drag thumbnails to reorder, turn any page left or right, delete the ones you don't need, then save everything into a new PDF in one go.",
      bn: "স্ক্যান করা ফাইলের পৃষ্ঠা উল্টাপাল্টা হয়ে গেছে বা কোনো পৃষ্ঠা কাত হয়ে আছে? থাম্বনেইল টেনে ক্রম ঠিক করুন, যেকোনো পৃষ্ঠা বাঁয়ে বা ডানে ঘোরান, দরকার নেই এমন পৃষ্ঠা মুছুন, তারপর একবারে নতুন PDF হিসেবে সেভ করুন।",
    },
    steps: [
      { en: "Drop your PDF to load the page thumbnails.", bn: "PDF দিন, পৃষ্ঠার থাম্বনেইল চলে আসবে।" },
      { en: "Drag pages into place, or use the arrow buttons under each page.", bn: "পৃষ্ঠা টেনে জায়গামতো বসান, অথবা প্রতিটি পৃষ্ঠার নিচের তীর বাটন ব্যবহার করুন।" },
      { en: "Rotate or delete single pages, or use All left / All right to turn every page.", bn: "আলাদা পৃষ্ঠা ঘোরান বা মুছুন, সব পৃষ্ঠা একসাথে ঘোরাতে “সব বাঁয়ে” বা “সব ডানে” চাপুন।" },
      { en: "Click Save PDF, then Download PDF.", bn: "“PDF সেভ করুন” চাপুন, তারপর “PDF ডাউনলোড করুন”।" },
    ],
    faqs: [
      {
        q: { en: "How do I change the order of pages in a PDF?", bn: "PDF-এর পৃষ্ঠার ক্রম কীভাবে বদলাব?" },
        a: {
          en: "Drag a page thumbnail to its new spot, or use the move earlier and move later arrows, then click Save PDF.",
          bn: "পৃষ্ঠার থাম্বনেইল টেনে নতুন জায়গায় ছেড়ে দিন, অথবা আগে আনুন আর পরে নিন তীর চাপুন, তারপর “PDF সেভ করুন” চাপুন।",
        },
      },
      {
        q: { en: "Can I undo my changes?", bn: "ভুল হলে কি আগের অবস্থায় ফেরানো যায়?" },
        a: {
          en: "Yes. Click Reset changes to go back to the original page order and rotation before you save.",
          bn: "হ্যাঁ। সেভ করার আগে “পরিবর্তন বাতিল করুন” চাপলে পৃষ্ঠার ক্রম আর ঘোরানো আগের মতো হয়ে যাবে।",
        },
      },
      {
        q: { en: "Can I rearrange pages from two different PDFs?", bn: "দুটি আলাদা PDF-এর পৃষ্ঠা কি একসাথে সাজানো যায়?" },
        a: {
          en: "This tool works on one PDF at a time. Merge the files first with Merge PDF, then open the merged file here to arrange the pages.",
          bn: "এই টুলে একবারে একটি PDF সাজানো যায়। আগে “PDF একত্র করুন” টুলে ফাইলগুলো জুড়ুন, তারপর সেই ফাইলটি এখানে খুলে পৃষ্ঠা সাজান।",
        },
      },
    ],
  },

  "rotate-pdf": {
    metaTitle: {
      en: "Rotate PDF Pages Online Free and Save",
      bn: "PDF রোটেট করুন অনলাইনে ফ্রি, পেজ ঘুরিয়ে সেভ",
    },
    metaDescription: {
      en: "Rotate all pages or only the ones you pick by 90° left, 90° right or 180°, then save. Free, no sign-up, and the PDF is rotated on your device, not a server.",
      bn: "সব পৃষ্ঠা বা শুধু বাছাই করা পৃষ্ঠা ৯০° বাঁয়ে, ৯০° ডানে বা ১৮০° ঘুরিয়ে সেভ করুন। ফ্রি, সাইন-আপ লাগে না, PDF সার্ভারে নয়, আপনার ডিভাইসেই ঘোরানো হয়।",
    },
    intro: {
      en: "Scanned pages upside down or sideways? Turn the whole document at once, or click just the pages that need fixing and rotate only those. The change is saved into the file, so it opens the right way everywhere.",
      bn: "স্ক্যান করা পৃষ্ঠা উল্টো বা কাত হয়ে আছে? পুরো ডকুমেন্ট একবারে ঘোরান, অথবা শুধু যেগুলো ঠিক করতে হবে সেগুলোতে ক্লিক করে ঘোরান। পরিবর্তনটা ফাইলেই সেভ হয়, তাই যেকোনো জায়গায় খুললে সোজা দেখাবে।",
    },
    steps: [
      { en: "Drop your PDF to see its pages.", bn: "PDF দিন, পৃষ্ঠাগুলো দেখা যাবে।" },
      { en: "Choose a direction: 90° left, 180° or 90° right.", bn: "দিক বাছুন: ৯০° বাঁয়ে, ১৮০° বা ৯০° ডানে।" },
      { en: "Keep All pages, or pick Some pages and click or type the ones to turn.", bn: "“সব পৃষ্ঠা” রাখুন, অথবা “কিছু পৃষ্ঠা” বেছে যেগুলো ঘোরাবেন সেগুলোতে ক্লিক করুন বা নম্বর লিখুন।" },
      { en: "Click Rotate, then Download PDF.", bn: "ঘোরানোর বাটন চাপুন, তারপর “PDF ডাউনলোড করুন”।" },
    ],
    faqs: [
      {
        q: { en: "How do I rotate just one page of a PDF?", bn: "PDF-এর শুধু একটি পৃষ্ঠা কীভাবে ঘোরাব?" },
        a: {
          en: "Click that page's thumbnail. The tool switches to Some pages and rotates only the pages you picked.",
          bn: "সেই পৃষ্ঠার থাম্বনেইলে ক্লিক করুন। টুলটি “কিছু পৃষ্ঠা” মোডে চলে যাবে আর শুধু বাছাই করা পৃষ্ঠাই ঘোরাবে।",
        },
      },
      {
        q: { en: "Will the rotation stay when I open the PDF later?", bn: "পরে খুললেও কি পৃষ্ঠা ঘোরানো অবস্থায় থাকবে?" },
        a: {
          en: "Yes. The rotation is written into the PDF itself, so it shows correctly in any PDF reader, browser or phone.",
          bn: "হ্যাঁ। ঘোরানোটা PDF ফাইলের ভেতরেই লেখা হয়, তাই যেকোনো PDF রিডার, ব্রাউজার বা মোবাইলে ঠিকঠাক দেখাবে।",
        },
      },
      {
        q: { en: "Does rotating a PDF lower its quality?", bn: "PDF ঘোরালে কি মান কমে যায়?" },
        a: {
          en: "No. Only the page orientation changes. The text and images are not redrawn or compressed.",
          bn: "না। শুধু পৃষ্ঠার দিক বদলায়, লেখা বা ছবি নতুন করে আঁকা বা কমপ্রেস করা হয় না।",
        },
      },
    ],
  },

  "pages-per-sheet": {
    metaTitle: {
      en: "Print Multiple PDF Pages per Sheet (2, 4 or 6)",
      bn: "এক পাতায় একাধিক PDF পেজ প্রিন্ট করুন",
    },
    metaDescription: {
      en: "Put 2, 4 or 6 PDF pages on each A4 sheet to save paper when printing notes or slides. Free, no upload: the new PDF is built right in your browser.",
      bn: "নোট বা স্লাইড প্রিন্টে কাগজ বাঁচাতে প্রতিটি A4 পাতায় ২, ৪ বা ৬টি PDF পৃষ্ঠা বসান। ফ্রি, আপলোড লাগে না, নতুন PDF আপনার ব্রাউজারেই তৈরি হয়।",
    },
    intro: {
      en: "Turn lecture slides, notes or handouts into a print-ready PDF with 2, 4 or 6 pages on every A4 sheet. Choose portrait or landscape and add thin borders if you like. Pages flow left to right, top to bottom, scaled to fit.",
      bn: "লেকচার স্লাইড, নোট বা হ্যান্ডআউট থেকে এমন PDF বানান যার প্রতিটি A4 পাতায় ২, ৪ বা ৬টি পৃষ্ঠা থাকবে। লম্বালম্বি বা আড়াআড়ি বাছুন, চাইলে প্রতিটি পৃষ্ঠার চারপাশে সরু বর্ডার দিন। পৃষ্ঠাগুলো বাঁ থেকে ডানে, ওপর থেকে নিচে মাপমতো বসে।",
    },
    steps: [
      { en: "Drop the PDF you want to print.", bn: "যে PDF প্রিন্ট করবেন সেটি দিন।" },
      { en: "Choose 2, 4 or 6 pages per sheet.", bn: "প্রতি পাতায় ২, ৪ বা ৬টি পৃষ্ঠা বাছুন।" },
      { en: "Pick Portrait or Landscape, and tick the border option if you want one.", bn: "লম্বালম্বি বা আড়াআড়ি বাছুন, বর্ডার চাইলে টিক দিন।" },
      { en: "Click Make sheets, then Download PDF and print it as usual.", bn: "“পাতা তৈরি করুন” চাপুন, তারপর PDF ডাউনলোড করে স্বাভাবিকভাবে প্রিন্ট দিন।" },
    ],
    faqs: [
      {
        q: { en: "How do I print 4 pages on one sheet?", bn: "এক পাতায় ৪টি পৃষ্ঠা কীভাবে প্রিন্ট করব?" },
        a: {
          en: "Choose 4 under Pages per sheet, click Make sheets and print the downloaded PDF at 100% scale. Each A4 sheet will hold four pages.",
          bn: "“প্রতি পাতায় পৃষ্ঠা” থেকে ৪ বাছুন, “পাতা তৈরি করুন” চাপুন, তারপর ডাউনলোড করা PDF ১০০% স্কেলে প্রিন্ট করুন। প্রতিটি A4 পাতায় চারটি পৃষ্ঠা থাকবে।",
        },
      },
      {
        q: { en: "What paper size does it use?", bn: "কোন সাইজের কাগজে পাতা তৈরি হয়?" },
        a: {
          en: "Sheets are always A4, in portrait or landscape. Each original page is shrunk to fit its cell without being stretched.",
          bn: "পাতা সবসময় A4 সাইজের হয়, লম্বালম্বি বা আড়াআড়ি। প্রতিটি মূল পৃষ্ঠা অনুপাত ঠিক রেখে নিজের ঘরের মাপে ছোট হয়।",
        },
      },
      {
        q: { en: "Will the text still be sharp?", bn: "লেখা কি পরিষ্কার থাকবে?" },
        a: {
          en: "Yes. Pages are placed as vector content, not screenshots, so text stays crisp. It is just printed smaller.",
          bn: "হ্যাঁ। পৃষ্ঠাগুলো স্ক্রিনশট হিসেবে নয়, মূল ভেক্টর আকারে বসানো হয়, তাই লেখা ঝকঝকে থাকে। শুধু আকারে ছোট হয়।",
        },
      },
    ],
  },

  "page-numbers": {
    metaTitle: {
      en: "Add Page Numbers to PDF Online, Free",
      bn: "PDF-এ পেজ নম্বর দিন, বাংলা বা ইংরেজি সংখ্যায়",
    },
    metaDescription: {
      en: "Number PDF pages in English or Bangla digits. Choose position, format, size and start number, or skip the cover. Free, and the file stays on your device.",
      bn: "PDF-এর পৃষ্ঠায় ইংরেজি বা বাংলা অঙ্কে নম্বর বসান। অবস্থান, ধরন, আকার আর শুরুর সংখ্যা ঠিক করুন, চাইলে প্রচ্ছদ বাদ দিন। ফ্রি, ফাইল আপনার ডিভাইসেই থাকে।",
    },
    intro: {
      en: "Add page numbers to a thesis, assignment or report in a few clicks. Pick one of six spots at the top or bottom, choose a format like 1, 1 / N or Page 1 of N, and use Bangla digits (১, ২, ৩) when the document is in Bangla.",
      bn: "থিসিস, অ্যাসাইনমেন্ট বা রিপোর্টে কয়েক ক্লিকেই পৃষ্ঠা নম্বর বসান। ওপরে বা নিচে ছয়টি জায়গার যেকোনোটি বাছুন, 1 বা 1 / N ধরনের ফরম্যাট দিন, আর বাংলা ডকুমেন্টে বাংলা অঙ্ক (১, ২, ৩) ব্যবহার করুন।",
    },
    steps: [
      { en: "Drop your PDF.", bn: "আপনার PDF দিন।" },
      { en: "Click where the number goes on the page preview.", bn: "পৃষ্ঠার প্রিভিউতে নম্বর কোথায় বসবে সেখানে ক্লিক করুন।" },
      { en: "Choose Digits, Format, Start at and Size, and tick Skip the first page if it is a cover.", bn: "অঙ্ক, ধরন, শুরুর সংখ্যা আর আকার ঠিক করুন, প্রথম পৃষ্ঠা প্রচ্ছদ হলে “প্রথম পৃষ্ঠা বাদ দিন” টিক দিন।" },
      { en: "Click Add page numbers, then Download PDF.", bn: "“পৃষ্ঠা নম্বর বসান” চাপুন, তারপর PDF ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "Can I add page numbers in Bangla?", bn: "বাংলা সংখ্যায় পৃষ্ঠা নম্বর দেওয়া যাবে?" },
        a: {
          en: "Yes. Set Digits to ১ ২ ৩ and the numbers are written in Bangla digits, as ৩ or ৩ / ১২. The Page 1 of N wording is available with English digits only.",
          bn: "হ্যাঁ। অঙ্ক অপশনে ১ ২ ৩ বাছলে নম্বর বাংলা অঙ্কে বসবে, যেমন ৩ বা ৩ / ১২। “Page 1 of N” ধরনটি শুধু ইংরেজি অঙ্কে পাওয়া যায়।",
        },
      },
      {
        q: { en: "How do I start numbering from page 2?", bn: "দ্বিতীয় পৃষ্ঠা থেকে নম্বর শুরু করব কীভাবে?" },
        a: {
          en: "Tick Skip the first page (cover). The cover stays blank and numbering begins on the next page from your Start at value.",
          bn: "“প্রথম পৃষ্ঠা (প্রচ্ছদ) বাদ দিন” টিক দিন। প্রচ্ছদে নম্বর বসবে না, পরের পৃষ্ঠা থেকে আপনার দেওয়া শুরুর সংখ্যা দিয়ে নম্বর শুরু হবে।",
        },
      },
      {
        q: { en: "Is it free to add page numbers to a PDF here?", bn: "এখানে PDF-এ পৃষ্ঠা নম্বর দেওয়া কি ফ্রি?" },
        a: {
          en: "Yes, completely. There is no sign-up, no watermark and no page limit, and the PDF is processed in your browser.",
          bn: "হ্যাঁ, পুরোপুরি ফ্রি। সাইন-আপ, ওয়াটারমার্ক বা পৃষ্ঠার সীমা নেই, আর PDF আপনার ব্রাউজারেই প্রসেস হয়।",
        },
      },
    ],
  },

  "watermark-pdf": {
    metaTitle: {
      en: "Add Watermark to PDF Online, Free Text Stamp",
      bn: "PDF-এ ওয়াটারমার্ক দিন অনলাইনে ফ্রি",
    },
    metaDescription: {
      en: "Stamp text like DRAFT or CONFIDENTIAL on every PDF page. Set size, colour, opacity, angle, centred or tiled. Free, and your PDF never leaves your device.",
      bn: "PDF-এর প্রতিটি পৃষ্ঠায় DRAFT বা CONFIDENTIAL-এর মতো লেখা বসান। আকার, রং, স্বচ্ছতা, কোণ আর মাঝখানে বা পুরো পাতায় বসানো ঠিক করুন। ফ্রি, PDF ডিভাইসের বাইরে যায় না।",
    },
    intro: {
      en: "Mark a document as a draft, a copy or confidential before you share it. Type your text, adjust size, colour, opacity and angle, and see a live preview on page 1 before the same mark goes on every page.",
      bn: "শেয়ার করার আগে ডকুমেন্টে Draft, Copy বা Confidential ছাপ দিন। লেখা টাইপ করুন, আকার, রং, স্বচ্ছতা আর কোণ ঠিক করুন, প্রথম পৃষ্ঠায় প্রিভিউ দেখে নিন, তারপর একই ছাপ সব পৃষ্ঠায় বসবে।",
    },
    steps: [
      { en: "Drop your PDF.", bn: "আপনার PDF দিন।" },
      { en: "Type the watermark text in English letters.", bn: "ওয়াটারমার্কের লেখা ইংরেজি অক্ষরে টাইপ করুন।" },
      { en: "Choose Centre or Tiled, then set colour, size, opacity and angle while watching the preview.", bn: "“মাঝখানে” বা “পুরো পাতায়” বাছুন, তারপর প্রিভিউ দেখে রং, আকার, স্বচ্ছতা আর কোণ ঠিক করুন।" },
      { en: "Click Add watermark, then Download PDF.", bn: "“ওয়াটারমার্ক বসান” চাপুন, তারপর PDF ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "Can I add a Bangla watermark?", bn: "বাংলায় ওয়াটারমার্ক দেওয়া যাবে?" },
        a: {
          en: "Not yet. The watermark supports English (Latin) letters only, so use text like DRAFT or your company name in English.",
          bn: "এখনো না। ওয়াটারমার্কে শুধু ইংরেজি (ল্যাটিন) অক্ষর চলে, তাই DRAFT বা প্রতিষ্ঠানের নাম ইংরেজিতে লিখুন।",
        },
      },
      {
        q: { en: "Can I use an image or logo as a watermark?", bn: "ছবি বা লোগো দিয়ে ওয়াটারমার্ক দেওয়া যায়?" },
        a: {
          en: "No, this tool stamps text only. You can repeat the text across the page with the Tiled option.",
          bn: "না, এই টুলে শুধু লেখার ওয়াটারমার্ক দেওয়া যায়। “পুরো পাতায়” অপশনে লেখাটি পুরো পৃষ্ঠাজুড়ে বারবার বসানো যায়।",
        },
      },
      {
        q: { en: "Can a watermark be removed later?", bn: "পরে কি ওয়াটারমার্ক সরানো যায়?" },
        a: {
          en: "The text is drawn onto each page, so it can't be switched off like a layer. Someone with a PDF editor could still delete it, so treat it as a visible label, not protection.",
          bn: "লেখাটি প্রতিটি পৃষ্ঠার ওপর আঁকা হয়, তাই লেয়ারের মতো বন্ধ করা যায় না। তবে PDF এডিটর দিয়ে কেউ চাইলে মুছতে পারে, তাই এটিকে দৃশ্যমান চিহ্ন ভাবুন, সুরক্ষা নয়।",
        },
      },
    ],
  },

  "sign-pdf": {
    metaTitle: {
      en: "Sign PDF Online Free: Draw, Type or Upload",
      bn: "PDF-এ সই করুন অনলাইনে ফ্রি, সিগনেচার বসান",
    },
    metaDescription: {
      en: "Draw, type or upload your signature and place it on a PDF page or all pages. Free, no account. Your PDF and signature stay in your browser, never uploaded.",
      bn: "সই এঁকে, নাম টাইপ করে বা ছবি দিয়ে PDF-এর একটি বা সব পৃষ্ঠায় বসান। ফ্রি, অ্যাকাউন্ট লাগে না। আপনার PDF আর সই ব্রাউজারেই থাকে, কোথাও আপলোড হয় না।",
    },
    intro: {
      en: "Sign a form, offer letter or agreement without printing it. Draw with your mouse, finger or stylus, type your name in a signature style, or upload a photo of your signature, then drag it into place and resize it.",
      bn: "প্রিন্ট না করেই ফর্ম, অফার লেটার বা চুক্তিপত্রে সই করুন। মাউস, আঙুল বা স্টাইলাস দিয়ে সই আঁকুন, নাম টাইপ করে সইয়ের স্টাইল বাছুন, অথবা সইয়ের ছবি দিন, তারপর টেনে জায়গামতো বসিয়ে মাপ ঠিক করুন।",
    },
    steps: [
      { en: "Drop the PDF you need to sign.", bn: "যে PDF-এ সই করবেন সেটি দিন।" },
      { en: "Create your signature with Draw, Type or Upload.", bn: "“আঁকুন”, “লিখুন” বা “ছবি দিন”, যেকোনো উপায়ে সই তৈরি করুন।" },
      { en: "Go to the right page, then drag the signature into place and resize it from the corner dot.", bn: "সঠিক পৃষ্ঠায় যান, সই টেনে জায়গামতো বসান আর কোণার ডট টেনে মাপ ঠিক করুন।" },
      { en: "Choose This page or All pages, click Sign PDF and download it.", bn: "“এই পৃষ্ঠা” বা “সব পৃষ্ঠা” বাছুন, “PDF-এ স্বাক্ষর করুন” চেপে ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "Is this a legally valid digital signature?", bn: "এটা কি আইনি ডিজিটাল সিগনেচার?" },
        a: {
          en: "It places a picture of your signature on the page, like signing on paper. It is not a certificate-based digital signature, so check what the receiver requires.",
          bn: "এটি কাগজে সই করার মতো, পৃষ্ঠায় আপনার সইয়ের ছবি বসায়। এটি সার্টিফিকেট-ভিত্তিক ডিজিটাল সিগনেচার নয়, তাই যিনি ফাইলটি নেবেন তাঁর কী দরকার তা জেনে নিন।",
        },
      },
      {
        q: { en: "Can I upload a photo of my signature?", bn: "সইয়ের ছবি তুলে কি আপলোড করা যায়?" },
        a: {
          en: "Yes. Choose Upload, pick a PNG, JPG or WebP image, and tick the option to make the white background transparent so it sits cleanly on the page.",
          bn: "হ্যাঁ। “ছবি দিন” বেছে PNG, JPG বা WebP ছবি দিন, আর সাদা ব্যাকগ্রাউন্ড স্বচ্ছ করার অপশনে টিক দিন যাতে পৃষ্ঠায় পরিষ্কারভাবে বসে।",
        },
      },
      {
        q: { en: "Is my signature saved anywhere?", bn: "আমার সই কি কোথাও জমা থাকে?" },
        a: {
          en: "No. Your signature and PDF are handled only in your browser and are not uploaded or stored on any server.",
          bn: "না। আপনার সই আর PDF শুধু ব্রাউজারেই ব্যবহার হয়, কোনো সার্ভারে আপলোড বা জমা হয় না।",
        },
      },
    ],
  },

  "edit-metadata": {
    metaTitle: {
      en: "Edit PDF Metadata Online: Title, Author, Keywords",
      bn: "PDF মেটাডেটা এডিট করুন: টাইটেল, লেখক, কিওয়ার্ড",
    },
    metaDescription: {
      en: "View and change a PDF's title, author, subject, keywords, creator and producer, or clear them all. Free and private, edited in your browser with no upload.",
      bn: "PDF-এর টাইটেল, লেখক, বিষয়, কিওয়ার্ড, ক্রিয়েটর আর প্রডিউসার দেখুন ও বদলান, চাইলে সব মুছে দিন। ফ্রি ও নিরাপদ, আপলোড ছাড়াই ব্রাউজারে এডিট হয়।",
    },
    intro: {
      en: "PDF files carry hidden details like a title, the author's name and the app that made them. See what your file says, fix a wrong title before sending it, or clear personal details. Empty fields are removed from the file.",
      bn: "PDF ফাইলের ভেতরে টাইটেল, লেখকের নাম, কোন অ্যাপে তৈরি এমন কিছু লুকানো তথ্য থাকে। ফাইলে কী লেখা আছে দেখুন, পাঠানোর আগে ভুল টাইটেল ঠিক করুন, বা ব্যক্তিগত তথ্য মুছে দিন। খালি রাখা ঘরগুলো ফাইল থেকে সরিয়ে ফেলা হয়।",
    },
    steps: [
      { en: "Drop your PDF to read its current metadata.", bn: "PDF দিন, বর্তমান মেটাডেটা দেখা যাবে।" },
      { en: "Edit Title, Author, Subject, Keywords, Creator or Producer.", bn: "টাইটেল, লেখক, বিষয়, কিওয়ার্ড, ক্রিয়েটর বা প্রডিউসার বদলান।" },
      { en: "Leave a field empty, or click Clear all, to remove details.", bn: "কোনো তথ্য সরাতে ঘরটি খালি রাখুন, অথবা “সব মুছুন” চাপুন।" },
      { en: "Click Save PDF, then Download PDF.", bn: "“PDF সেভ করুন” চাপুন, তারপর PDF ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "How do I change the title of a PDF?", bn: "PDF-এর টাইটেল কীভাবে বদলাব?" },
        a: {
          en: "Type the new text in the Title field and save. This is the name many PDF readers and browser tabs show, which can differ from the file name.",
          bn: "টাইটেল ঘরে নতুন লেখা দিয়ে সেভ করুন। অনেক PDF রিডার আর ব্রাউজার ট্যাবে এই নামটিই দেখায়, যা ফাইলের নাম থেকে আলাদা হতে পারে।",
        },
      },
      {
        q: { en: "How do I remove the author name from a PDF?", bn: "PDF থেকে লেখকের নাম কীভাবে সরাব?" },
        a: {
          en: "Clear the Author field, or click Clear all to empty every field, then save. Empty fields are removed from the file.",
          bn: "লেখক ঘরটি খালি করুন, অথবা সব ঘর একবারে খালি করতে “সব মুছুন” চাপুন, তারপর সেভ করুন। খালি ঘরগুলো ফাইল থেকে সরে যায়।",
        },
      },
      {
        q: { en: "Can I change the creation date?", bn: "তৈরির তারিখ কি বদলানো যায়?" },
        a: {
          en: "No. The created and last modified dates are shown for reference only. The modified date is updated to now when you save.",
          bn: "না। তৈরি আর সর্বশেষ পরিবর্তনের তারিখ শুধু দেখার জন্য। সেভ করলে সর্বশেষ পরিবর্তনের তারিখ বর্তমান সময়ে বদলে যায়।",
        },
      },
    ],
  },

  "image-to-pdf": {
    metaTitle: {
      en: "JPG to PDF Converter: Combine Images into One PDF",
      bn: "JPG থেকে PDF, ছবি দিয়ে PDF বানান ফ্রি",
    },
    metaDescription: {
      en: "Turn JPG, PNG and WebP images or phone scans into one PDF. Pick A4, Letter or fit to image, plus margins. Free, and images never leave your device.",
      bn: "JPG, PNG, WebP ছবি বা মোবাইলে তোলা স্ক্যান দিয়ে একটি PDF বানান। A4, Letter বা ছবির মাপ আর মার্জিন বাছুন। ফ্রি, ছবি আপনার ডিভাইসের বাইরে যায় না।",
    },
    intro: {
      en: "Put photos of your NID, certificates or handwritten notes into a single PDF for an application or email. Each image becomes one page, in the order you set, and most JPG and PNG files are added without re-compressing them.",
      bn: "আবেদন বা ইমেইলের জন্য NID, সার্টিফিকেট বা হাতে লেখা নোটের ছবি একটি PDF-এ ভরুন। প্রতিটি ছবি একটি করে পৃষ্ঠা হয়, আপনার ঠিক করা ক্রমে, আর বেশিরভাগ JPG বা PNG ছবি নতুন করে কমপ্রেস না করেই যোগ হয়।",
    },
    steps: [
      { en: "Drop your images, or click to choose them.", bn: "ছবিগুলো টেনে আনুন, অথবা ক্লিক করে বাছাই করুন।" },
      { en: "Use Move up and Move down to set the page order.", bn: "“ওপরে নিন” আর “নিচে নিন” দিয়ে পৃষ্ঠার ক্রম ঠিক করুন।" },
      { en: "Choose Page size (Fit image, A4 or Letter), Orientation and Margin.", bn: "পৃষ্ঠার মাপ (ছবির মাপে, A4 বা Letter), দিক আর মার্জিন বাছুন।" },
      { en: "Click Create PDF, then Download PDF.", bn: "“PDF তৈরি করুন” চাপুন, তারপর PDF ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "How do I convert multiple JPGs into one PDF?", bn: "একাধিক JPG ছবি কীভাবে একটি PDF করব?" },
        a: {
          en: "Add all the images at once, arrange them in order and click Create PDF. Every image becomes a page in the same file.",
          bn: "সব ছবি একসাথে দিন, ক্রম ঠিক করে “PDF তৈরি করুন” চাপুন। প্রতিটি ছবি একই ফাইলের একটি করে পৃষ্ঠা হবে।",
        },
      },
      {
        q: { en: "Can I convert iPhone HEIC photos to PDF?", bn: "iPhone-এর HEIC ছবি কি PDF করা যাবে?" },
        a: {
          en: "Only in Safari, which can open HEIC. In other browsers, convert the photos to JPG first and then add them here.",
          bn: "শুধু Safari ব্রাউজারে, কারণ সেটি HEIC খুলতে পারে। অন্য ব্রাউজারে আগে ছবিগুলো JPG-তে রূপান্তর করে তারপর এখানে দিন।",
        },
      },
      {
        q: { en: "Will my photos lose quality in the PDF?", bn: "PDF-এ কি ছবির মান কমে যাবে?" },
        a: {
          en: "Most JPG and PNG images go into the PDF as they are, so they keep their full quality. Other formats like WebP, and rotated or CMYK JPGs, are converted first, and very large images are scaled down to fit browser limits.",
          bn: "বেশিরভাগ JPG আর PNG ছবি হুবহু PDF-এ যায়, তাই মান ঠিক থাকে। WebP-এর মতো অন্য ফরম্যাট, আর ঘোরানো বা CMYK JPG আগে রূপান্তর করা হয়, আর খুব বড় ছবি ব্রাউজারের সীমার মধ্যে রাখতে কিছুটা ছোট করা হয়।",
        },
      },
    ],
  },

  "pdf-to-jpg": {
    metaTitle: {
      en: "PDF to JPG Converter, Free and No Upload",
      bn: "PDF থেকে JPG করুন অনলাইনে ফ্রি",
    },
    metaDescription: {
      en: "Convert PDF pages to JPG images at 72, 150 or 300 dpi with adjustable quality. Pick pages or convert all. Free, private, and rendered on your own device.",
      bn: "PDF-এর পৃষ্ঠা ৭২, ১৫০ বা ৩০০ dpi-তে JPG ছবি করুন, মানও ঠিক করে নিন। সব পৃষ্ঠা বা নির্দিষ্ট পৃষ্ঠা বাছুন। ফ্রি ও নিরাপদ, কাজ হয় আপনার ডিভাইসেই।",
    },
    intro: {
      en: "Save PDF pages as JPG images to post on social media, send on WhatsApp or upload to a form that only accepts pictures. Choose the resolution and quality, convert every page or just a few, and download them one by one or all in a ZIP.",
      bn: "ফেসবুকে পোস্ট, হোয়াটসঅ্যাপে পাঠানো বা শুধু ছবি নেয় এমন ফর্মে দেওয়ার জন্য PDF-এর পৃষ্ঠা JPG ছবি করে নিন। রেজোলিউশন আর মান বাছুন, সব পৃষ্ঠা বা কয়েকটি রূপান্তর করুন, তারপর আলাদা করে বা সব একসাথে ZIP-এ ডাউনলোড করুন।",
    },
    steps: [
      { en: "Drop your PDF.", bn: "আপনার PDF দিন।" },
      { en: "Choose a resolution (72, 150 or 300 dpi) and set the JPG quality.", bn: "রেজোলিউশন (৭২, ১৫০ বা ৩০০ dpi) আর JPG-এর মান ঠিক করুন।" },
      { en: "Leave Pages empty for all pages, or type a range like 1-3, 5.", bn: "সব পৃষ্ঠার জন্য পৃষ্ঠার ঘর খালি রাখুন, অথবা 1-3, 5 এভাবে লিখুন।" },
      { en: "Click Convert to JPG, then download each image or all as a ZIP.", bn: "“JPG-এ রূপান্তর করুন” চাপুন, তারপর আলাদা ছবি বা সব একসাথে ZIP ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "What resolution should I choose?", bn: "কোন রেজোলিউশন বাছব?" },
        a: {
          en: "Use 72 dpi for quick screen viewing, 150 dpi for most uses, and 300 dpi when you plan to print or need small text to stay readable.",
          bn: "স্ক্রিনে দেখার জন্য ৭২ dpi, সাধারণ কাজে ১৫০ dpi, আর প্রিন্ট বা ছোট লেখা পরিষ্কার রাখতে ৩০০ dpi বাছুন।",
        },
      },
      {
        q: { en: "Can I convert only one page of a PDF to JPG?", bn: "PDF-এর শুধু একটি পৃষ্ঠা কি JPG করা যায়?" },
        a: {
          en: "Yes. Type that page number in the Pages box, such as 3, and only that page is converted.",
          bn: "হ্যাঁ। পৃষ্ঠার ঘরে সেই পৃষ্ঠার নম্বর লিখুন, যেমন 3, তাহলে শুধু সেই পৃষ্ঠাটিই ছবি হবে।",
        },
      },
      {
        q: { en: "Does it work with password-protected PDFs?", bn: "পাসওয়ার্ড দেওয়া PDF-এ কি কাজ করবে?" },
        a: {
          en: "PDFs that need a password to open can't be converted. Unlock the file first, then convert it here.",
          bn: "যে PDF খুলতে পাসওয়ার্ড লাগে সেটি রূপান্তর করা যায় না। আগে ফাইলটি আনলক করুন, তারপর এখানে রূপান্তর করুন।",
        },
      },
    ],
  },

  "pdf-to-png": {
    metaTitle: {
      en: "Convert PDF to PNG Online, High Quality & Free",
      bn: "PDF থেকে PNG করুন, হাই কোয়ালিটি ছবি ফ্রি",
    },
    metaDescription: {
      en: "Save PDF pages as lossless PNG images at up to 300 dpi. Convert all pages or a range, download singly or as a ZIP. Free, and your PDF is never uploaded.",
      bn: "PDF-এর পৃষ্ঠা ৩০০ dpi পর্যন্ত মান না হারানো PNG ছবি হিসেবে সেভ করুন। সব বা নির্দিষ্ট পৃষ্ঠা, আলাদা বা ZIP-এ নিন। ফ্রি, আপনার PDF কখনো আপলোড হয় না।",
    },
    intro: {
      en: "PNG keeps text, lines and charts sharp with no compression blur, which makes it a good choice for slides, diagrams and documents you want to edit or reuse. Pick the resolution and the pages, and download the images singly or in one ZIP.",
      bn: "PNG ফরম্যাটে কমপ্রেশনের ঝাপসা ভাব থাকে না, তাই লেখা, রেখা আর চার্ট ঝকঝকে থাকে। স্লাইড, ডায়াগ্রাম বা পরে এডিট করবেন এমন ডকুমেন্টের জন্য এটি ভালো। রেজোলিউশন আর পৃষ্ঠা বাছুন, তারপর ছবিগুলো আলাদা বা একটি ZIP-এ ডাউনলোড করুন।",
    },
    steps: [
      { en: "Drop your PDF.", bn: "আপনার PDF দিন।" },
      { en: "Choose a resolution: 72, 150 or 300 dpi.", bn: "রেজোলিউশন বাছুন: ৭২, ১৫০ বা ৩০০ dpi।" },
      { en: "Leave Pages empty for all pages, or type a range like 2-4.", bn: "সব পৃষ্ঠার জন্য পৃষ্ঠার ঘর খালি রাখুন, অথবা 2-4 এভাবে লিখুন।" },
      { en: "Click Convert to PNG and download your images.", bn: "“PNG-এ রূপান্তর করুন” চেপে ছবিগুলো ডাউনলোড করুন।" },
    ],
    faqs: [
      {
        q: { en: "PNG or JPG: which is better for PDF pages?", bn: "PDF পৃষ্ঠার জন্য PNG ভালো, না JPG?" },
        a: {
          en: "PNG is lossless and best for text, charts and line art. JPG files are smaller and work well for photos, so use PDF to JPG when file size matters more.",
          bn: "PNG মান হারায় না, তাই লেখা, চার্ট আর রেখাচিত্রের জন্য সেরা। JPG ফাইল ছোট হয় আর ছবির জন্য ভালো, তাই ফাইল সাইজ বেশি জরুরি হলে PDF থেকে JPG টুল ব্যবহার করুন।",
        },
      },
      {
        q: { en: "Why are my PNG files so large?", bn: "PNG ফাইলগুলো এত বড় কেন?" },
        a: {
          en: "Lossless images keep every pixel, so they are bigger than JPGs, especially at 300 dpi. Choose 150 or 72 dpi for smaller files.",
          bn: "মান না হারানো ছবিতে প্রতিটি পিক্সেল থাকে, তাই JPG-এর চেয়ে বড় হয়, বিশেষ করে ৩০০ dpi-তে। ছোট ফাইল চাইলে ১৫০ বা ৭২ dpi বাছুন।",
        },
      },
      {
        q: { en: "Will the PNG have a transparent background?", bn: "PNG ছবির ব্যাকগ্রাউন্ড কি স্বচ্ছ হবে?" },
        a: {
          en: "No. Pages are rendered the way a PDF reader shows them, so the page background stays as it appears on screen.",
          bn: "না। PDF রিডারে পৃষ্ঠা যেভাবে দেখায় সেভাবেই ছবি তৈরি হয়, তাই পৃষ্ঠার ব্যাকগ্রাউন্ড স্ক্রিনে যেমন দেখায় তেমনই থাকে।",
        },
      },
    ],
  },

  "pdf-to-text": {
    metaTitle: {
      en: "PDF to Text: Extract Text from PDF Free",
      bn: "PDF থেকে লেখা কপি করুন, টেক্সট বের করুন ফ্রি",
    },
    metaDescription: {
      en: "Pull the text out of a PDF and copy it or download a .txt file, with optional page markers. Free and private: the PDF is read in your browser, not uploaded.",
      bn: "PDF-এর ভেতরের লেখা বের করে কপি করুন বা .txt ফাইল হিসেবে নামান, চাইলে পৃষ্ঠা চিহ্নসহ। ফ্রি ও নিরাপদ, PDF আপলোড না করে ব্রাউজারেই পড়া হয়।",
    },
    intro: {
      en: "Get the text out of a PDF so you can edit, search or reuse it. The tool reads the PDF's own text layer, then lets you copy everything or save it as a .txt file, with or without page separators.",
      bn: "PDF-এর লেখা বের করে আনুন, যাতে এডিট, খোঁজা বা অন্য কাজে ব্যবহার করতে পারেন। টুলটি PDF-এর নিজস্ব টেক্সট লেয়ার পড়ে, তারপর সব লেখা কপি করতে বা পৃষ্ঠা বিভাজকসহ বা ছাড়া .txt ফাইল হিসেবে সেভ করতে দেয়।",
    },
    steps: [
      { en: "Drop your PDF and wait for the text to be read.", bn: "PDF দিন, লেখা পড়া শেষ হওয়া পর্যন্ত অপেক্ষা করুন।" },
      { en: "Choose Page markers or Plain for the output.", bn: "আউটপুটে “পৃষ্ঠা চিহ্নসহ” বা “শুধু লেখা” বাছুন।" },
      { en: "Click Copy text, or Download .txt to save a file.", bn: "“লেখা কপি করুন” চাপুন, অথবা ফাইল হিসেবে নিতে “.txt ডাউনলোড করুন” চাপুন।" },
    ],
    faqs: [
      {
        q: { en: "Why is no text found in my PDF?", bn: "আমার PDF-এ কোনো লেখা পাওয়া যাচ্ছে না কেন?" },
        a: {
          en: "Your PDF is probably a scan, which holds pictures of pages rather than real text. Use Bangla OCR to read Bangla and English text from the page images.",
          bn: "সম্ভবত PDF-টি স্ক্যান করা, যেখানে আসল লেখার বদলে পৃষ্ঠার ছবি থাকে। পৃষ্ঠার ছবি থেকে বাংলা ও ইংরেজি লেখা পড়তে বাংলা OCR টুল ব্যবহার করুন।",
        },
      },
      {
        q: { en: "Why does Bangla text come out garbled?", bn: "বাংলা লেখা ভেঙে আসছে কেন?" },
        a: {
          en: "Older PDFs often use Bijoy fonts like SutonnyMJ, which store Bangla as English letters. Paste the result into Bijoy to Unicode to turn it back into readable Bangla.",
          bn: "পুরোনো অনেক PDF-এ সুতনিএমজের মতো বিজয় ফন্ট থাকে, যেখানে বাংলা লেখা ইংরেজি অক্ষরে জমা থাকে। ফলাফলটি “বিজয় → ইউনিকোড” টুলে পেস্ট করলে আবার পড়ার মতো বাংলা পাবেন।",
        },
      },
      {
        q: { en: "Does it keep the formatting and tables?", bn: "ফরম্যাটিং আর টেবিল কি ঠিক থাকে?" },
        a: {
          en: "No. You get plain text only, so fonts, colours and table layouts are not kept.",
          bn: "না। শুধু সাধারণ লেখা পাবেন, তাই ফন্ট, রং বা টেবিলের সাজানো রূপ থাকে না।",
        },
      },
    ],
  },
};
