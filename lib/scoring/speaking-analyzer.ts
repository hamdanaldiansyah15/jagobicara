export interface SpeakingAnalysisInput {
  topicTitle: string;
  topicPrompt?: string;
  durationSeconds: number;
  transcribedText?: string;
  audioRecorded: boolean;
}

export interface SpeakingScoreBreakdown {
  fluency: number;
  ideaDev: number;
  relevance: number;
  structure: number;
  vocabulary: number;
}

export interface SpeakingAnalysisResult {
  scores: SpeakingScoreBreakdown;
  finalScore: number;
  isValid: boolean;
  evaluationLabel: string;
  feedback: string;
  dimensionNotes: Record<keyof SpeakingScoreBreakdown, string>;
  transcript: string;
  correctedTranscript: string;
  removedWords: string[];
  suggestedAdditions: string[];
  wordCount: number;
  wordsPerMinute: number;
  fillerCount: number;
  repetitionCount: number;
  durationScore: number;
}

export interface ISpeakingAnalyzer {
  analyze(input: SpeakingAnalysisInput): Promise<SpeakingAnalysisResult>;
}

const fillerWords = new Set([
  "eee", "ee", "e", "em", "emm", "eh", "ehem", "hmm", "hmmm", "anu", "eng",
]);

const stopWords = new Set([
  "yang", "dan", "atau", "dengan", "untuk", "dari", "pada", "dalam", "adalah", "itu",
  "ini", "saya", "aku", "kita", "kami", "anda", "kamu", "karena", "agar", "bisa", "akan",
  "juga", "lebih", "sangat", "sebagai", "tentang", "dapat", "oleh", "tidak", "dengan",
  "bagaimana", "mengapa", "apa", "menurut", "ketika", "jika", "maka", "saat", "para",
  "sebuah", "suatu", "diri", "mereka", "tersebut", "menjadi", "terhadap", "serta", "secara",
]);

const openingMarkers = ["menurut saya", "pertama", "saya ingin", "topik ini", "pada kesempatan"];
const closingMarkers = ["kesimpulannya", "jadi", "oleh karena itu", "akhir kata", "intinya", "dengan demikian"];
const transitionMarkers = ["selain itu", "misalnya", "contohnya", "namun", "kemudian", "pertama", "kedua", "terakhir"];

function tokenize(text: string) {
  return text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*|[.,!?;:]/gu) || [];
}

function countWords(text: string) {
  return (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || []).length;
}

function normalizeScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function hasAny(text: string, phrases: string[]) {
  const normalized = text.toLocaleLowerCase("id-ID");
  return phrases.some((phrase) => normalized.includes(phrase));
}

function cleanTranscript(text: string) {
  const sourceTokens = tokenize(text);
  const cleaned: string[] = [];
  const removedWords: string[] = [];
  let repetitionCount = 0;
  const sourceWordCount = countWords(text);
  const connectorLimits = new Map([
    ["dan", Math.max(2, Math.ceil(sourceWordCount * 0.15))],
    ["lalu", Math.max(1, Math.ceil(sourceWordCount * 0.1))],
    ["terus", Math.max(1, Math.ceil(sourceWordCount * 0.1))],
    ["kemudian", Math.max(1, Math.ceil(sourceWordCount * 0.1))],
    ["jadi", Math.max(1, Math.ceil(sourceWordCount * 0.1))],
  ]);
  const connectorCounts = new Map<string, number>();

  for (const token of sourceTokens) {
    if (/^[.,!?;:]$/.test(token)) {
      if (cleaned.length && !/^[.,!?;:]$/.test(cleaned[cleaned.length - 1])) cleaned.push(token);
      continue;
    }

    const normalized = token.toLocaleLowerCase("id-ID").replace(/[.!?,;:]+$/g, "");
    if (fillerWords.has(normalized)) {
      removedWords.push(token);
      continue;
    }

    if (connectorLimits.has(normalized)) {
      const nextCount = (connectorCounts.get(normalized) || 0) + 1;
      connectorCounts.set(normalized, nextCount);
      if (nextCount > connectorLimits.get(normalized)!) {
        removedWords.push(token);
        repetitionCount += 1;
        continue;
      }
    }

    const previous = [...cleaned].reverse().find((part) => !/^[.,!?;:]$/.test(part));
    if (previous && previous.toLocaleLowerCase("id-ID") === normalized) {
      removedWords.push(token);
      repetitionCount += 1;
      continue;
    }

    cleaned.push(token);
  }

  const joined = cleaned.join(" ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/([.!?])(?=\S)/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();
  const correctedTranscript = joined
    ? joined.charAt(0).toLocaleUpperCase("id-ID") + joined.slice(1)
    : "";

  return { correctedTranscript, removedWords, repetitionCount };
}

function getTopicKeywords(topicTitle: string, topicPrompt = "") {
  return new Set(
    tokenize(`${topicTitle} ${topicPrompt}`)
      .map((token) => token.toLocaleLowerCase("id-ID"))
      .filter((token) => token.length >= 4 && !stopWords.has(token) && !fillerWords.has(token)),
  );
}

function emptyResult(input: SpeakingAnalysisInput, transcript: string, reason: string): SpeakingAnalysisResult {
  const cleaned = cleanTranscript(transcript);
  return {
    scores: { fluency: 0, ideaDev: 0, relevance: 0, structure: 0, vocabulary: 0 },
    finalScore: 0,
    isValid: false,
    evaluationLabel: "Penilaian berbasis transkrip latihan",
    feedback: reason,
    dimensionNotes: {
      fluency: "Skor 0 karena latihan tidak memenuhi syarat minimum.",
      ideaDev: "Transkrip atau durasi belum cukup untuk mengukur pengembangan ide.",
      relevance: "Transkrip atau durasi belum cukup untuk mengukur relevansi.",
      structure: "Transkrip atau durasi belum cukup untuk mengukur struktur.",
      vocabulary: "Transkrip atau durasi belum cukup untuk mengukur kosakata.",
    },
    transcript,
    correctedTranscript: cleaned.correctedTranscript,
    removedWords: cleaned.removedWords,
    suggestedAdditions: [],
    wordCount: countWords(transcript),
    wordsPerMinute: input.durationSeconds > 0 ? Math.round((countWords(transcript) / input.durationSeconds) * 60) : 0,
    fillerCount: cleaned.removedWords.filter((word) => fillerWords.has(word.toLocaleLowerCase("id-ID"))).length,
    repetitionCount: cleaned.repetitionCount,
    durationScore: normalizeScore((Math.max(0, Math.min(60, input.durationSeconds)) / 60) * 100),
  };
}

export class RuleBasedSpeakingAnalyzer implements ISpeakingAnalyzer {
  async analyze(input: SpeakingAnalysisInput): Promise<SpeakingAnalysisResult> {
    const transcript = (input.transcribedText || "").trim();
    const durationSeconds = Math.max(0, Math.min(60, input.durationSeconds));
    const wordCount = countWords(transcript);
    const wordsPerMinute = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;
    const cleaned = cleanTranscript(transcript);
    const fillerCount = cleaned.removedWords.filter((word) => fillerWords.has(word.toLocaleLowerCase("id-ID"))).length;
    const durationScore = normalizeScore((durationSeconds / 60) * 100);

    if (!input.audioRecorded || durationSeconds < 15) {
      return emptyResult(
        { ...input, durationSeconds },
        transcript,
        "Nilai 0: durasi rekaman harus minimal 15 detik. Latihan yang sangat singkat belum dapat dinilai secara adil.",
      );
    }
    if (wordCount < 5) {
      return emptyResult(
        { ...input, durationSeconds },
        transcript,
        "Nilai 0: transkrip terlalu sedikit untuk dianalisis. Pastikan mikrofon dan fitur transkripsi browser aktif, lalu ulangi latihan.",
      );
    }

    const words = tokenize(cleaned.correctedTranscript).filter((token) => !/^[.,!?;:]$/.test(token));
    const normalizedWords = words.map((word) => word.toLocaleLowerCase("id-ID"));
    const lexicalWords = normalizedWords.filter((word) => word.length >= 3 && !stopWords.has(word));
    const uniqueLexical = new Set(lexicalWords);
    const lexicalDiversity = lexicalWords.length ? uniqueLexical.size / lexicalWords.length : 0;
    const sentenceCount = (cleaned.correctedTranscript.match(/[.!?]+/g) || []).length || 1;
    const fillerRate = fillerCount / Math.max(1, wordCount);

    const paceScore = wordsPerMinute < 60
      ? (wordsPerMinute / 60) * 55
      : wordsPerMinute < 100
      ? 55 + ((wordsPerMinute - 60) / 40) * 35
      : wordsPerMinute <= 160
      ? 90 + ((wordsPerMinute - 100) / 60) * 10
      : Math.max(0, 100 - (wordsPerMinute - 160) * 1.25);
    const fluency = normalizeScore(paceScore - Math.min(40, fillerRate * 500) - cleaned.repetitionCount * 8);

    const exampleMarkers = ["misalnya", "contohnya", "sebagai contoh", "contoh nyata", "pengalaman"];
    const ideaDev = normalizeScore(
      Math.min(55, (wordCount / 100) * 55) +
      Math.min(20, (sentenceCount / 4) * 20) +
      Math.min(15, (uniqueLexical.size / 12) * 15) +
      (hasAny(cleaned.correctedTranscript, exampleMarkers) ? 10 : 0),
    );

    const topicKeywords = getTopicKeywords(input.topicTitle, input.topicPrompt);
    const transcriptKeywords = new Set(normalizedWords.filter((word) => word.length >= 4 && !stopWords.has(word)));
    const overlap = [...topicKeywords].filter((keyword) => transcriptKeywords.has(keyword)).length;
    const relevance = normalizeScore(
      topicKeywords.size === 0 ? 50 : 20 + Math.min(1, overlap / Math.max(2, topicKeywords.size * 0.35)) * 80,
    );

    const hasOpening = hasAny(cleaned.correctedTranscript, openingMarkers);
    const hasClosing = hasAny(cleaned.correctedTranscript, closingMarkers);
    const transitionCount = transitionMarkers.filter((marker) => cleaned.correctedTranscript.toLocaleLowerCase("id-ID").includes(marker)).length;
    const structure = normalizeScore(
      Math.min(35, sentenceCount * 9) +
      (hasOpening ? 20 : 0) +
      (hasClosing ? 20 : 0) +
      Math.min(25, transitionCount * 9),
    );

    const vocabulary = normalizeScore(
      Math.min(100, lexicalDiversity * 150) - Math.min(30, fillerRate * 400) - cleaned.repetitionCount * 5,
    );

    const scores = { fluency, ideaDev, relevance, structure, vocabulary };
    const contentScore =
      fluency * 0.25 +
      ideaDev * 0.20 +
      relevance * 0.20 +
      structure * 0.20 +
      vocabulary * 0.15;
    const durationAdjustedScore = contentScore * 0.70 + durationScore * 0.30;
    const tempoMultiplier = 0.85 + (paceScore / 100) * 0.15;
    const finalScore = normalizeScore(durationAdjustedScore * tempoMultiplier);

    const suggestedAdditions: string[] = [];
    if (!hasOpening) suggestedAdditions.push("Menurut saya, ...");
    if (!hasAny(cleaned.correctedTranscript, exampleMarkers)) suggestedAdditions.push("Sebagai contoh, ...");
    if (!hasClosing) suggestedAdditions.push("Kesimpulannya, ...");

    const dimensionNotes = {
      fluency: `Kecepatan ${wordsPerMinute} kata/menit; ${fillerCount} filler dan ${cleaned.repetitionCount} pengulangan langsung terdeteksi.`,
      ideaDev: `${wordCount} kata, ${sentenceCount} kalimat, dan ${uniqueLexical.size} kosakata isi yang berbeda.`,
      relevance: `${overlap} dari ${topicKeywords.size} kata kunci topik muncul di transkrip.`,
      structure: `Pembuka ${hasOpening ? "terdeteksi" : "belum terdeteksi"}; penutup ${hasClosing ? "terdeteksi" : "belum terdeteksi"}; ${transitionCount} jenis transisi ditemukan.`,
      vocabulary: `Keragaman kosakata isi ${(lexicalDiversity * 100).toFixed(0)}%; pengulangan/filler menurunkan nilai.`,
    };

    const feedbackParts = [
      `Kamu berbicara ${wordsPerMinute} kata per menit selama ${durationSeconds} detik (${wordCount} kata tercatat).`,
      fillerCount || cleaned.repetitionCount
        ? `Kurangi ${fillerCount} kata pengisi dan ${cleaned.repetitionCount} pengulangan langsung yang ditandai merah.`
        : "Tidak ditemukan filler atau pengulangan kata yang berlebihan pada transkrip.",
      `Pemakaian waktu memberi kontribusi ${durationScore}/100; sesi penuh 60 detik memberi bobot durasi maksimum.`,
    ];

    return {
      scores,
      finalScore,
      isValid: true,
      evaluationLabel: "Penilaian otomatis berbasis transkrip dan durasi",
      feedback: feedbackParts.join(" "),
      dimensionNotes,
      transcript,
      correctedTranscript: cleaned.correctedTranscript,
      removedWords: cleaned.removedWords,
      suggestedAdditions,
      wordCount,
      wordsPerMinute,
      fillerCount,
      repetitionCount: cleaned.repetitionCount,
      durationScore,
    };
  }
}

export const speakingAnalyzer: ISpeakingAnalyzer = new RuleBasedSpeakingAnalyzer();