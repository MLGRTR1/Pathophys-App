# Paper Practice

Run `npm start`, then open http://127.0.0.1:3000. No dependency installation needed. Run `node verify.cjs` for content, scoring and citation checks.

The bank currently contains 93 MCQs: 43 lecture-supported, 33 external-reference-supported, and 17 labelled source-key questions. Eight written prompts include self-assessment checklists and lecture references. Six problematic questions are excluded from scoring with reasons shown in Verification notes. This is a checked subset; conversion of every recoverable question across the papers remains incomplete.

The nine supplied course lectures (487 PDF pages), three papers (446 PDF pages), and two additional images are preserved locally. Lecture search and answer feedback link directly to PDF pages. Original paper OCR drafts contain errors and are not automatically promoted into scored questions. Japanese printed keys and remembered changed variants remain separate.

Use Practise supported answers for the 76 MCQs corroborated by lectures or external references. Topic practice and mocks also include clearly labelled source-key items. Explanations distinguish paper keys, course material, reference support and any correction of source annotations. PDF page numbers can differ from slide numbers.

Features include topic practice, timed mocks, partial-credit multiple-select scoring, mistake review, bookmarks, question search, lecture search, written practice, question entry, JSON import/export and themes. Progress and written responses stay in this browser. Export backups before clearing browser data or moving devices.

Question scoring awards a fraction for correct choices and subtracts a fraction for incorrect choices, floored at zero. Latest-answer accuracy requires the entire correct selection. Exam answers remain hidden until submission. Written answers are self-assessed separately.

The app does not extract new PDFs automatically. New content can be prepared from papers provided in chat or imported as JSON. Correct indices are zero-based. Imports merge matching IDs; backup restore replaces data after confirmation.

For static hosting, include index.html, style.css, app.js, evidence-ui.js, source-library.js, course-ui.js and both papers/ and lectures/ directories. No public hosting or cloud sync is configured. Publishing these folders would publish the supplied documents too.
