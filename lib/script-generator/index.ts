export type ScriptType = "MC" | "SAMBUTAN" | "MODERATOR" | "PRESENTASI";
export type EventStyle = "Formal" | "Semi-formal" | "Non-formal";
export type LanguageTone = "Formal" | "Hangat" | "Santai" | "Profesional";

export interface McScriptInput {
  eventType: EventStyle;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  honoredGuests: string[]; // e.g. ["Kepala Desa Simbang", "Ketua Karang Taruna"]
  agendaItems: string[];   // e.g. ["Pembukaan", "Menyanyikan Lagu Indonesia Raya", "Sambutan Ketua Panitia", "Acara Inti", "Doa", "Penutup"]
  tone: LanguageTone;
}

export interface SambutanScriptInput {
  eventName: string;
  speakerRole: string;     // e.g. "Ketua Panitia", "Ketua Komunitas", "Perwakilan Pemuda"
  purpose: string;         // e.g. "Membuka acara dan mengapresiasi kehadiran seluruh peserta"
  audience: string;        // e.g. "Rekan-rekan pemuda dan tokoh masyarakat"
  tone: LanguageTone;
  mainPoints: string[];    // e.g. ["Pentingnya peran pemuda", "Apresiasi kerja keras panitia", "Harapan untuk masa depan"]
}

export interface ModeratorScriptInput {
  eventName: string;
  topic: string;
  speakers: { name: string; title: string }[];
  durationMinutes: number;
  tone: LanguageTone;
}

export interface PresentationScriptInput {
  title: string;
  audience: string;
  purpose: string;
  durationMinutes: number;
  mainPoints: string[];
  tone: LanguageTone;
}

export class ScriptGenerator {
  static generateMcScript(input: McScriptInput): string {
    const { eventType, eventName, eventDate, eventLocation, honoredGuests, agendaItems, tone } = input;

    let opening = "";
    if (eventType === "Formal" || tone === "Formal") {
      opening = `Assalamu’alaikum Warahmatullahi Wabarakatuh,\nSelamat pagi/siang dan salam sejahtera untuk kita semua.\nOm Swastiastu, Namo Buddhaya, Salam Kebajikan.\n\nYang terhormat para tamu undangan, serta segenap hadirin yang berbahagia.\n\nPuji dan syukur marilah kita panjatkan ke hadirat Tuhan Yang Maha Esa, karena atas rahmat dan karunia-Nya, pada hari ini, ${eventDate || "yang berbahagia ini"}, kita dapat berkumpul di ${eventLocation || "tempat ini"} dalam keadaan sehat walafiat untuk mengikuti acara: "${eventName}".`;
    } else if (eventType === "Semi-formal" || tone === "Hangat") {
      opening = `Selamat pagi/siang rekan-rekan dan hadirin sekalian!\n\nSenang sekali rasanya bisa membersamai teman-teman semua dalam acara yang luar biasa ini: "${eventName}".\n\nSelamat datang di ${eventLocation || "ruang pertemuan kita"}, hari ini ${eventDate || "bersama-sama"} kita akan berproses, belajar, dan saling bertukar inspirasi.`;
    } else {
      opening = `Halo teman-teman semua! Semangat pagi!\n\nWah, energinya luar biasa banget hari ini! Selamat datang di acara "${eventName}".\nTerima kasih buat teman-teman yang sudah hadir tepat waktu di ${eventLocation || "lokasi kita hari ini"}. Pastikan hari ini kita seru-seruan bareng dan pulang bawa ilmu baru!`;
    }

    // Honored Guests section
    let guestSection = "";
    if (honoredGuests && honoredGuests.length > 0) {
      guestSection = `\n\n[PENGHORMATAN TAMU UNDANGAN]\n`;
      guestSection += `Pada kesempatan yang istimewa ini, kami mengucapkan selamat datang dan terima kasih yang setinggi-tingginya kepada:\n`;
      honoredGuests.forEach((guest, idx) => {
        if (idx === 0) {
          guestSection += `1. Yang terhormat Bapak/Ibu ${guest}\n`;
        } else {
          guestSection += `${idx + 1}. Yang kami hormati Bapak/Ibu ${guest}\n`;
        }
      });
      guestSection += `Serta seluruh peserta dan hadirin yang kami banggakan.`;
    }

    // Agenda flow
    let agendaSection = `\n\n[SUSUNAN ACARA]\n`;
    agendaSection += `Hadirin yang kami hormati, perkenankanlah saya selaku pembawa acara membacakan susunan acara pada hari ini:\n`;
    agendaItems.forEach((item, idx) => {
      agendaSection += `${idx + 1}. ${item}\n`;
    });

    // Step-by-step cue scripts
    let cuesSection = `\n\n[PANDUAN & TRANSISI MC TIAP SESI]\n`;
    agendaItems.forEach((item, idx) => {
      cuesSection += `\n--- Sesi ${idx + 1}: ${item} ---\n`;
      const itemLower = item.toLowerCase();

      if (itemLower.includes("buka") || itemLower.includes("pembukaan")) {
        cuesSection += `MC: "Memasuki agenda pertama yaitu pembukaan, marilah kita buka acara ini dengan membaca basmalah bersama-sama (atau berdoa menurut agama dan keyakinan masing-masing). Berdoa dipersilakan."\n`;
      } else if (itemLower.includes("indonesia raya") || itemLower.includes("lagu")) {
        cuesSection += `MC: "Acara selanjutnya adalah menyanyikan lagu kebangsaan Indonesia Raya. Hadirin dimohon berdiri."\n(Setelah lagu selesai)\nMC: "Hadirin dipersilakan duduk kembali."\n`;
      } else if (itemLower.includes("sambutan")) {
        cuesSection += `MC: "Hadirin sekalian, agenda berikutnya adalah ${item}. Kepada yang terhormat, waktu dan tempat kami persilakan."\n(Setelah sambutan)\nMC: "Terima kasih banyak kami sampaikan atas sambutan yang penuh inspirasi dan arahan yang telah diberikan."\n`;
      } else if (itemLower.includes("inti") || itemLower.includes("materi") || itemLower.includes("seminar") || itemLower.includes("diskusi")) {
        cuesSection += `MC: "Kini tibalah kita pada agenda utama yang paling kita nantikan, yaitu ${item}. Sesi ini akan dipandu secara langsung oleh moderator/narasumber kita. Kepada yang bertugas, layar dan panggung kami persilakan."\n`;
      } else if (itemLower.includes("tanya") || itemLower.includes("q&a")) {
        cuesSection += `MC: "Kami membuka sesi tanya jawab untuk hadirin sekalian. Bagi yang ingin mengajukan pertanyaan, silakan mengangkat tangan atau menuliskan di kolom interaksi."\n`;
      } else if (itemLower.includes("doa")) {
        cuesSection += `MC: "Sebagai wujud rasa syukur dan memohon keberkahan atas kelancaran acara, marilah kita sejenak menundukkan kepala untuk berdoa bersama. Pembacaan doa akan dipimpin oleh petugas. Kepada yang bertugas, kami persilakan."\n`;
      } else if (itemLower.includes("tutup") || itemLower.includes("penutup")) {
        cuesSection += `MC: "Tidak terasa kita telah sampai di penghujung acara hari ini. Terima kasih kepada seluruh pemateri, tamu undangan, dan peserta yang telah berpartisipasi dengan penuh antusias."\n`;
      } else {
        cuesSection += `MC: "Memasuki sesi berikutnya yaitu ${item}. Kepada pihak yang bersangkutan, waktu dan tempat kami haturkan."\n`;
      }
    });

    // Closing
    let closing = `\n\n[PENUTUP]\n`;
    if (eventType === "Formal" || tone === "Formal") {
      closing += `Saya selaku pembawa acara mewakili seluruh panitia penyelenggara memohon maaf apabila terdapat tutur kata maupun perbuatan yang kurang berkenan sepanjang jalannya acara.\n\nWabillahi taufiq wal hidayah,\nWassalamu’alaikum Warahmatullahi Wabarakatuh.`;
    } else {
      closing += `Saya pamit undur diri, terima kasih atas energi dan kebersamaan kalian yang luar biasa hari ini! Sampai jumpa di kegiatan seru berikutnya!\n\nJago Bicara: Belajar. Berlatih. Berani Bicara!`;
    }

    return `${opening}${guestSection}${agendaSection}${cuesSection}${closing}`;
  }

  static generateSambutanScript(input: SambutanScriptInput): string {
    const { eventName, speakerRole, purpose, audience, tone, mainPoints } = input;

    let opening = "";
    if (tone === "Formal") {
      opening = `Assalamu’alaikum Warahmatullahi Wabarakatuh,\nSelamat pagi dan salam sejahtera untuk kita semua.\n\nYang saya hormati segenap jajaran pembina, panitia, serta seluruh ${audience} yang saya banggakan.`;
    } else {
      opening = `Assalamu’alaikum Wr. Wb. dan salam hangat untuk rekan-rekan semua!\n\nYang saya hormati para tamu undangan, serta sahabat-sahabat ${audience} yang penuh semangat hari ini.`;
    }

    let roleContext = `\n\nBerdiri saya di sini selaku ${speakerRole}, mewakili rekan-rekan sekalian, merasa sangat bersyukur dan bangga dapat hadir di tengah-tengah acara "${eventName}". Kehadiran kita bersama di sini memiliki tujuan yang sangat mulia, yaitu ${purpose}.`;

    let pointsElaboration = `\n\nHadirin sekalian yang saya hormati,\nDalam kesempatan yang sangat baik ini, ada beberapa hal penting yang ingin saya sampaikan:`;

    mainPoints.forEach((point, idx) => {
      pointsElaboration += `\n\nPoin ke-${idx + 1}: ${point}.\nHal ini penting menjadi perhatian kita bersama agar tujuan besar yang kita rencanakan tidak hanya berhenti sebagai gagasan, melainkan terwujud dalam tindakan nyata yang bermanfaat bagi lingkungan dan komunitas kita.`;
    });

    let appreciation = `\n\nSaya ingin menyampaikan apresiasi yang setinggi-tingginya kepada seluruh panitia yang telah bekerja keras tanpa lelah menyiapkan kegiatan ini. Terima kasih juga kepada seluruh ${audience} atas antusiasme dan komitmen yang luar biasa.`;

    let closing = "";
    if (tone === "Formal") {
      closing = `\n\nAkhir kata, marilah kita jadikan momentum acara ini sebagai langkah awal yang memperkuat sinergi dan karya kita ke depan.\n\nMohon maaf atas segala kekurangan dalam penyampaian saya.\nSekian dan terima kasih.\nWassalamu’alaikum Warahmatullahi Wabarakatuh.`;
    } else {
      closing = `\n\nMari kita manfaatkan kesempatan ini sebaik-baiknya. Jangan pernah ragu untuk bersuara, bertukar ide, dan berani mengambil langkah!\n\nTerima kasih semuanya, selamat berproses!\nWassalamu’alaikum Warahmatullahi Wabarakatuh.`;
    }

    return `${opening}${roleContext}${pointsElaboration}${appreciation}${closing}`;
  }

  static generateModeratorScript(input: ModeratorScriptInput): string {
    const { eventName, topic, speakers, durationMinutes, tone } = input;

    const opening = `Assalamu’alaikum Wr. Wb., Selamat pagi/siang rekan-rekan sekalian!\n\nSelamat datang di sesi diskusi "${eventName}".\nPerkenalkan saya yang akan memandu jalannya sesi diskusi interaktif kita hari ini dengan tema yang sangat menarik dan relevan: "${topic}".\n\nDalam durasi kurang lebih ${durationMinutes} menit ke depan, kita akan membedah berbagai sudut pandang menarik, insight mendalam, dan tentu saja kesempatan bagi rekan-rekan untuk bertanya langsung kepada narasumber kita.`;

    let speakerBios = `\n\n[PENGENALAN NARASUMBER]\nHari ini kita sangat beruntung karena telah hadir narasumber yang sangat kompeten di bidangnya:\n`;
    speakers.forEach((s, idx) => {
      speakerBios += `${idx + 1}. ${s.name} - ${s.title}\n`;
    });

    const groundRules = `\n[TATA TERTIB SESI]\nAgar sesi kita berjalan efektif dan nyaman bagi semua pihak:\n1. Narasumber akan memaparkan materi selama kurang lebih ${Math.round(durationMinutes * 0.6)} menit.\n2. Sesi tanya jawab akan dibuka setelah seluruh pemaparan selesai.\n3. Pertanyaan dapat disampaikan secara langsung (open mic) atau dituliskan di kolom pesan dengan format: [Nama_Instansi/Komunitas_Pertanyaan].`;

    const inviteSpeaker = `\n\n[MEMPERSILAKAN PEMBICARA]\nTanpa berlama-lama lagi, mari kita sambut narasumber kita yang pertama, kepada Bapak/Ibu/Kak ${speakers[0]?.name || "Narasumber"}, layar dan waktu kami persilakan!`;

    const qaTransition = `\n\n[TRANSISI TANYA JAWAB]\n"Terima kasih banyak kepada narasumber atas pemaparannya yang begitu membuka wawasan! Poin penting yang bisa kita garis bawahi adalah bagaimana konsistensi dan keberanian berbicara dapat membawa dampak besar.\nKini kita masuk ke sesi tanya jawab. Bagi hadirin yang ingin bertanya, kami persilakan!"`;

    const closing = `\n\n[KESIMPULAN & PENUTUP MODERATOR]\n"Hadirin sekalian, sebagai penutup sesi hari ini: ilmu tidak akan berdampak tanpa adanya keberanian untuk mempraktikkannya. Terima kasih sebesar-besarnya kepada para narasumber atas ilmu yang dibagikan, serta rekan-rekan atas diskusinya yang sangat hidup.\nSaya pamit undur diri dan mengembalikan waktu kepada pembawa acara. Wassalamu’alaikum Wr. Wb."`;

    return `${opening}${speakerBios}${groundRules}${inviteSpeaker}${qaTransition}${closing}`;
  }

  static generatePresentationScript(input: PresentationScriptInput): string {
    const { title, audience, purpose, durationMinutes, mainPoints, tone } = input;

    const hook = `[PEMBUKAAN - HOOK & TUJUAN]\n"Pernahkah Anda membayangkan bagaimana satu ide sederhana dapat mengubah cara kita melihat dunia di sekitar kita?\n\nSelamat pagi/siang rekan-rekan ${audience}.\nNama saya hari ini hadir di hadapan Anda untuk membahas topik: '${title}'.\nDalam waktu ${durationMinutes} menit ke depan, tujuan utama saya adalah untuk ${purpose}."`;

    let body = `\n\n[ISI UTAMA - POIN & ARGUMEN]`;
    mainPoints.forEach((point, idx) => {
      body += `\n\n--- Poin ${idx + 1}: ${point} ---\n`;
      body += `"Mari kita mulai dari aspek pertama. Mengapa ${point} menjadi kunci penting? Berdasarkan pengalaman dan data yang ada, ketika kita memperhatikan ${point}, kita mampu menciptakan solusi yang berkelanjutan dan terukur. Sebagai contoh nyata..."`;
    });

    const climax = `\n\n[KLIMAKS & PESAN KUNCI]\n"Dari seluruh pembahasan tadi, ada satu pesan utama yang ingin saya titipkan kepada rekan-rekan ${audience}: perubahan besar selalu dimulai dari keputusan kecil yang berani kita ambil hari ini."`;

    const closing = `\n\n[CALL TO ACTION & PENUTUP]\n"Oleh karena itu, saya mengajak kita semua untuk tidak hanya mendengarkan, tetapi mulai melangkah bersama.\nTerima kasih banyak atas perhatian dan waktu berharga rekan-rekan semua.\nSaya membuka sesi ini untuk pertanyaan dan diskusi lebih lanjut. Terima kasih!"`;

    return `${hook}${body}${climax}${closing}`;
  }
}
