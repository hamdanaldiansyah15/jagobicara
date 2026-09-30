const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const INDONESIAN_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function getCurrentSeasonKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Database seeding is disabled in production.");
  }

  console.log("Seeding database JAGO BICARA...");

  // 1. Clean existing records in reverse dependency order
  await prisma.certificate.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.moduleProgress.deleteMany();
  await prisma.module.deleteMany();
  await prisma.speakingAttempt.deleteMany();
  await prisma.speakingTopic.deleteMany();
  await prisma.communityMember.deleteMany();
  await prisma.community.deleteMany();
  await prisma.scriptTemplate.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash passwords
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const demoPasswordHash = await bcrypt.hash("password123", 10);

  // 3. Create Communities
  const simbangCommunity = await prisma.community.create({
    data: {
      name: "Komunitas Pemuda Simbang",
      address: "Kecamatan Simbang, Kabupaten Maros, Sulawesi Selatan",
      code: "SIMBANG26",
      description: "Wadah pemuda Simbang untuk belajar, berlatih, dan membangun rasa percaya diri dalam berbicara di depan publik.",
      status: "ACTIVE",
    },
  });

  const fokusCommunity = await prisma.community.create({
    data: {
      name: "Forum Komunikasi Muda Nusantara",
      address: "Kota Makassar, Sulawesi Selatan",
      code: "FOKUS26",
      description: "Komunitas komunikasi aktif untuk pemuda lintas daerah di Indonesia.",
      status: "ACTIVE",
    },
  });

  console.log("Communities seeded.");

  // 4. Create Admin Users
  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Administrator",
      age: 26,
      gender: "Laki-laki",
      email: "admin1@jagobicara.id",
      whatsapp: "081234567890",
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  const commAdminSimbang = await prisma.user.create({
    data: {
      name: "Pembina Simbang (Admin 2)",
      age: 28,
      gender: "Laki-laki",
      email: "admin2@jagobicara.id",
      whatsapp: "081234567891",
      passwordHash: adminPasswordHash,
      role: Role.COMMUNITY_ADMIN,
      communityMembers: {
        create: {
          communityId: simbangCommunity.id,
        },
      },
    },
  });

  const commAdminFokus = await prisma.user.create({
    data: {
      name: "Pembina Fokus (Admin 3)",
      age: 27,
      gender: "Perempuan",
      email: "admin3@jagobicara.id",
      whatsapp: "081234567892",
      passwordHash: adminPasswordHash,
      role: Role.COMMUNITY_ADMIN,
      communityMembers: {
        create: {
          communityId: fokusCommunity.id,
        },
      },
    },
  });

  console.log("Admins seeded.");

  // 5. Create Demo Participants
  const participantsData = [
    { name: "Ahmad Fauzi", email: "ahmad@demo.id", age: 20, gender: "Laki-laki", whatsapp: "082100010001" },
    { name: "Nabila Putri", email: "nabila@demo.id", age: 19, gender: "Perempuan", whatsapp: "082100010002" },
    { name: "Fajar Ramadhan", email: "fajar@demo.id", age: 21, gender: "Laki-laki", whatsapp: "082100010003" },
    { name: "Siti Rahma", email: "siti@demo.id", age: 20, gender: "Perempuan", whatsapp: "082100010004" },
    { name: "Rizky Pratama", email: "rizky@demo.id", age: 22, gender: "Laki-laki", whatsapp: "082100010005" },
    { name: "Dimas Anggara", email: "dimas@demo.id", age: 19, gender: "Laki-laki", whatsapp: "082100010006" },
  ];

  const participantUsers = [];
  for (const p of participantsData) {
    const user = await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        age: p.age,
        gender: p.gender,
        whatsapp: p.whatsapp,
        passwordHash: demoPasswordHash,
        role: Role.PARTICIPANT,
        communityMembers: {
          create: {
            communityId: simbangCommunity.id,
          },
        },
      },
    });
    participantUsers.push(user);
  }

  console.log("Demo participants seeded.");

  // 6. Seed Speaking Topics (32 comprehensive topics across categories)
  const topicsData = [
    // Daily Life
    {
      category: "Daily Life",
      title: "Kebiasaan Kecil yang Membuat Hidup Lebih Produktif",
      prompt: "Ceritakan satu kebiasaan kecil sehari-hari yang menurutmu sangat berpengaruh pada produktivitas dan semangat belajarmu!",
      tips: "Awali dengan menyebutkan rutinitas pagimu atau trik manajemen waktu sederhana.",
    },
    {
      category: "Daily Life",
      title: "Pentingnya Menjaga Keseimbangan Antara Istirahat dan Bekerja",
      prompt: "Bagaimana caramu mengenali tanda-tanda kelelahan dan cara efektif memulihkan energi tanpa merasa bersalah?",
      tips: "Gunakan contoh nyata saat kamu merasa burnout dan bagaimana kamu bangkit.",
    },
    {
      category: "Daily Life",
      title: "Mengelola Waktu di Tengah Kesibukan",
      prompt: "Apa tips terbaikmu untuk mengatur jadwal agar tugas, organisasi, dan waktu pribadi tetap seimbang?",
      tips: "Sebutkan teknik seperti to-do list atau pembagian prioritas.",
    },

    // Education
    {
      category: "Education",
      title: "Teknologi Mengubah Cara Anak Muda Belajar",
      prompt: "Menurutmu, apakah kehadiran internet dan AI membuat kita lebih pintar atau justru lebih malas berpikir kritis?",
      tips: "Berikan pandangan berimbang antara kemudahan akses informasi dan pentingnya verifikasi fakta.",
    },
    {
      category: "Education",
      title: "Pendidikan Karakter vs Prestasi Akademik",
      prompt: "Manakah yang lebih menentukan keberhasilan seseorang di dunia nyata: nilai rapor yang tinggi atau sikap kejujuran dan etos kerja?",
      tips: "Gunakan analogi dunia kerja atau kehidupan bermasyarakat.",
    },
    {
      category: "Education",
      title: "Membaca Buku di Era Video Pendek",
      prompt: "Mengapa kemampuan membaca mendalam tetap penting di saat perhatian kita terbiasa dengan konten kilat?",
      tips: "Bahas tentang daya konsentrasi dan imajinasi.",
    },

    // Technology
    {
      category: "Technology",
      title: "Kecerdasan Buatan (AI) Teman atau Ancaman?",
      prompt: "Bagaimana generasi muda menyikapi perkembangan AI agar tetap memiliki nilai tawar yang unik dan manusiawi?",
      tips: "Fokus pada kreativitas, empati, dan kemampuan komunikasi verbal.",
    },
    {
      category: "Technology",
      title: "Bijak Bermedia Sosial Tanpa Terjebak FOMO",
      prompt: "Bagaimana cara kita menjaga kesehatan mental dari tekanan tren dan pencitraan di media sosial?",
      tips: "Ajak audiens fokus pada pencapaian diri sendiri ketimbang membandingkan hidup dengan orang lain.",
    },
    {
      category: "Technology",
      title: "Peluang Karier Digital untuk Pemuda Desa",
      prompt: "Bagaimana akses internet dapat membuka jalan bagi pemuda di pelosok untuk bersaing di tingkat global?",
      tips: "Sebutkan contoh peluang freelance, kreator konten, atau e-commerce lokal.",
    },

    // Youth & Leadership
    {
      category: "Youth",
      title: "Mengapa Kemampuan Berbicara Sangat Penting Bagi Pemimpin?",
      prompt: "Buktikan mengapa seorang pemimpin hebat harus mampu menyampaikan visinya dengan jelas dan membangkitkan semangat orang lain!",
      tips: "Ambil figur pemimpin inspiratif yang kamu kagumi.",
    },
    {
      category: "Youth",
      title: "Mengatasi Rasa Takut Gagal Saat Mencoba Hal Baru",
      prompt: "Ceritakan pengalaman atau pandanganmu tentang mengapa kegagalan adalah guru terbaik menuju kedewasaan.",
      tips: "Gunakan kata-kata yang memotivasi dan empati.",
    },
    {
      category: "Youth",
      title: "Peran Pemuda Sebagai Agen Perubahan di Masyarakat",
      prompt: "Apa aksi nyata paling sederhana yang bisa dilakukan anak muda untuk membantu lingkungannya hari ini?",
      tips: "Fokus pada inisiatif lokal seperti kebersihan lingkungan atau gerakan literasi.",
    },

    // Communication
    {
      category: "Communication",
      title: "Rahasia Membuat Presentasi Menjadi Memikat",
      prompt: "Apa yang membuat sebuah presentasi diingat oleh audiens: slide yang indah atau cerita yang menyentuh?",
      tips: "Jelaskan peran storytelling dan kontak mata.",
    },
    {
      category: "Communication",
      title: "Seni Mendengarkan Secara Aktif",
      prompt: "Mengapa pembicara yang hebat selalu berawal dari pendengar yang baik? Jelaskan pandanganmu!",
      tips: "Tekankan bahwa komunikasi adalah proses dua arah yang membutuhkan penghargaan.",
    },
    {
      category: "Communication",
      title: "Mengatasi Rasa Gugup di Depan Panggung",
      prompt: "Bagikan teknik praktis yang kamu lakukan ketika tangan berkeringat dan jantung berdegup kencang sebelum berbicara!",
      tips: "Ceritakan tentang teknik pernapasan diafragma dan mindset 'audiens adalah teman'.",
    },

    // Environment
    {
      category: "Environment",
      title: "Langkah Nyata Mengurangi Sampah Plastik Sekali Pakai",
      prompt: "Bagaimana kita bisa membiasakan gaya hidup ramah lingkungan tanpa merasa terbebani dalam kehidupan sehari-hari?",
      tips: "Bahas kebiasaan membawa botol minum, kantong belanja, dan memilah sampah rumah tangga.",
    },
    {
      category: "Environment",
      title: "Krisis Iklim dan Masa Depan Generasi Kita",
      prompt: "Mengapa isu pemanasan global harus menjadi perhatian utama anak muda, bukan hanya para ilmuwan?",
      tips: "Kaitkan dengan perubahan cuaca ekstrem dan dampaknya terhadap pangan.",
    },
    {
      category: "Environment",
      title: "Gerakan Penghijauan di Lingkungan Terdekat",
      prompt: "Mengapa menanam pohon dan merawat ruang terbuka hijau di desa atau kampung menjadi investasi hidup jangka panjang?",
      tips: "Gambarkan udara segar dan resapan air yang terlindungi.",
    },

    // Community & Culture
    {
      category: "Community",
      title: "Kekuatan Gotong Royong yang Mulai Terlupakan",
      prompt: "Bagaimana cara kita menghidupkan kembali semangat kebersamaan dan gotong royong di tengah arus individualisme modern?",
      tips: "Ambil tradisi kerja bakti atau sambatan yang ada di daerahmu.",
    },
    {
      category: "Community",
      title: "Membangun Ruang Aman Bagi Pemuda untuk Berkembang",
      prompt: "Apa kriteria sebuah komunitas yang baik dalam mendukung anggotanya agar tidak takut berekspresi?",
      tips: "Bahas rasa saling menghargai, ketiadaan bullying, dan keterbukaan ide.",
    },
    {
      category: "Culture",
      title: "Melestarikan Budaya Lokal di Tengah Budaya Pop Global",
      prompt: "Bagaimana anak muda bisa bangga pada bahasa dan seni daerah tanpa terlihat ketinggalan zaman?",
      tips: "Sebutkan perpaduan seni tradisional dengan media digital dan musik kontemporer.",
    },

    // Organization & Social Issues
    {
      category: "Organization",
      title: "Menyelesaikan Perbedaan Pendapat Dalam Tim",
      prompt: "Ketika ada konflik ide di dalam organisasi, bagaimana caramu mencari titik temu yang adil bagi semua anggota?",
      tips: "Bahas pentingnya musyawarah dan menurunkan ego demi kepentingan bersama.",
    },
    {
      category: "Organization",
      title: "Etika Mengkritik yang Membangun",
      prompt: "Bagaimana cara menyampaikan masukan kepada rekan satu tim tanpa melukai perasaan atau menjatuhkan semangatnya?",
      tips: "Jelaskan metode sandwich feedback (pujian - kritik konstruktif - penyemangat).",
    },
    {
      category: "Social issues",
      title: "Menghapus Stigma Kesehatan Mental di Masyarakat",
      prompt: "Mengapa kita tidak boleh menyepelekan stres atau depresi pada remaja, dan bagaimana menjadi teman yang suportif?",
      tips: "Tekankan pentingnya ruang empati dan tidak menghakimi.",
    },

    // Personal Development & General
    {
      category: "Personal Development",
      title: "Arti Menjadi Otentik dan Percaya pada Diri Sendiri",
      prompt: "Apa arti menjadi diri sendiri di dunia yang sering menuntut kita untuk menjadi orang lain?",
      tips: "Tekankan pentingnya menemukan keunikan dan nilai prinsip pribadi.",
    },
    {
      category: "Personal Development",
      title: "Kekuatan Konsistensi Dibanding Motivasi Sesaat",
      prompt: "Mengapa orang yang konsisten 15 menit setiap hari lebih berhasil daripada orang yang bersemangat hanya sehari?",
      tips: "Gunakan konsep compound interest atau pembentukan kebiasaan baru.",
    },
    {
      category: "General knowledge",
      title: "Literasi Finansial Awal untuk Kemandirian Anak Muda",
      prompt: "Mengapa belajar menabung dan membedakan kebutuhan serta keinginan harus dimulai sejak usia muda?",
      tips: "Berikan contoh pengeluaran impulsif dan trik menyisihkan uang saku.",
    },
    {
      category: "General knowledge",
      title: "Menjaga Sopan Santun di Era Serba Digital",
      prompt: "Apakah etika di dunia maya sama pentingnya dengan etika di dunia nyata? Jelaskan pandanganmu!",
      tips: "Komentar di internet meninggalkan jejak digital dan dapat berdampak pada masa depan.",
    },
    {
      category: "Communication",
      title: "Bahasa Tubuh yang Menunjukkan Percaya Diri",
      prompt: "Sebutkan bagaimana kontak mata, postur tegap, dan senyuman dapat melipatgandakan dampak bicaramu!",
      tips: "Praktikkan dengan membayangkan dirimu berdiri di hadapan 100 orang penonton.",
    },
    {
      category: "Personal Development",
      title: "Menemukan Passion Melalui Eksplorasi",
      prompt: "Bagaimana cara kita mengetahui apa yang benar-benar kita sukai jika kita belum pernah mencobanya?",
      tips: "Ajak anak muda untuk berani keluar dari zona nyaman.",
    },
    {
      category: "Culture",
      title: "Menghargai Keberagaman Pendapat dan Latar Belakang",
      prompt: "Bagaimana keberagaman membuat sebuah bangsa atau kelompok menjadi lebih kaya dan berwarna?",
      tips: "Hubungkan dengan semboyan Bhinneka Tunggal Ika.",
    },
    {
      category: "Social issues",
      title: "Peran Komunikasi Dalam Memperbaiki Hubungan Sosial",
      prompt: "Banyak masalah terjadi hanya karena salah paham. Bagaimana komunikasi terbuka dapat menjadi solusinya?",
      tips: "Bahas pentingnya tabayyun atau konfirmasi sebelum mengambil kesimpulan.",
    },
  ];

  for (const t of topicsData) {
    await prisma.speakingTopic.create({
      data: t,
    });
  }

  console.log(`Seeded ${topicsData.length} speaking topics.`);

  // 7. Seed Speaking Attempts for the current season to verify the Leaderboard Formula:
  // Leaderboard Score = Average of 2 best valid speaking scores in the current season
  const seasonKey = getCurrentSeasonKey();

  const attemptsSeed = [
    // Ahmad: 72, 81, 88, 84 -> Best 2: 88, 84 -> Avg = 86
    { userIdx: 0, scores: [72, 81, 88, 84] },
    // Nabila: 79, 85, 91 -> Best 2: 91, 85 -> Avg = 88
    { userIdx: 1, scores: [79, 85, 91] },
    // Fajar: 75, 82, 86 -> Best 2: 86, 82 -> Avg = 84
    { userIdx: 2, scores: [75, 82, 86] },
    // Siti: 70, 78, 80 -> Best 2: 80, 78 -> Avg = 79
    { userIdx: 3, scores: [70, 78, 80] },
    // Rizky: 74, 76 -> Best 2: 76, 74 -> Avg = 75
    { userIdx: 4, scores: [74, 76] },
    // Dimas: 82 (Single valid attempt -> provisional score 82)
    { userIdx: 5, scores: [82] },
  ];

  for (const item of attemptsSeed) {
    const user = participantUsers[item.userIdx];
    for (let i = 0; i < item.scores.length; i++) {
      const finalScore = item.scores[i];
      // Generate realistic dimension scores around the target final score
      const f = finalScore;
      await prisma.speakingAttempt.create({
        data: {
          userId: user.id,
          topicTitle: topicsData[i % topicsData.length].title,
          duration: 55 + (i % 5),
          fluency: Math.min(100, f + ((i % 3) - 1)),
          ideaDev: Math.min(100, f + (((i + 1) % 3) - 1)),
          relevance: Math.min(100, f + (((i + 2) % 3) - 1)),
          structure: Math.min(100, f - ((i % 2))),
          vocabulary: Math.min(100, f + ((i % 2))),
          finalScore: finalScore,
          feedback: `Latihan ke-${i + 1} dengan topik "${topicsData[i % topicsData.length].title}". Penampilan cukup percaya diri dengan alur yang jelas.`,
          seasonKey: seasonKey,
          valid: true,
          createdAt: new Date(Date.now() - (item.scores.length - i) * 86400000),
        },
      });
    }
  }

  console.log("Seeded speaking attempts with realistic leaderboard scores.");

  // 8. Seed 5 Modules with Structured Material, 10 Questions each, and Badges
  const modulesData = [
    {
      order: 1,
      title: "Dasar Public Speaking",
      subtitle: "Membangun Fondasi, Kepercayaan Diri, dan Memahami Audiens",
      description: "Pelajari apa itu public speaking sesungguhnya, bagaimana mengendalikan rasa gugup, memahami siapa pendengarmu, dan mempersiapkan diri dengan tepat.",
      badge: {
        name: "Dasar Public Speaking",
        description: "Lulus modul dasar public speaking dan memahami fondasi rasa percaya diri.",
        icon: "award",
      },
      content: JSON.stringify({
        summary: "Public speaking bukan sekadar bakat bawaan, melainkan keterampilan terlatih yang dapat dikuasai oleh siapa saja melalui pemahaman prinsip dasar dan latihan teratur.",
        chapters: [
          {
            title: "1. Apa Itu Public Speaking?",
            body: "Public speaking adalah proses komunikasi lisan secara terstruktur di hadapan sekelompok pendengar dengan tujuan tertentu—seperti menginformasikan, membujuk, menghibur, atau menggerakkan tindakan. Kunci utama public speaking bukan kesempurnaan kata-kata, melainkan kejelasan pesan yang sampai ke hati pendengar.",
            tip: "Fokuslah pada pesan yang kamu bawa, bukan pada rasa takutmu dihakimi.",
          },
          {
            title: "2. Mengubah Gugup Menjadi Energi Positif",
            body: "Rasa gugup (stage fright) adalah respon alami tubuh yang melepaskan adrenalin saat menghadapi situasi menantang. Jangan memusuhi rasa gugup! Alihkan energi tersebut menjadi antusiasme bicaramu. Tarik napas dalam melalui diafragma (4 detik tarik, 4 detik tahan, 4 detik hembuskan) untuk menenangkan detak jantung sebelum melangkah ke depan.",
            tip: "Audiens menginginkan kamu berhasil, mereka bukan juri yang mencari kesalahanmu.",
          },
          {
            title: "3. Memahami Siapa Audiensmu",
            body: "Sebelum berbicara, selalu jawab 3 pertanyaan kunci: Siapa mereka (usia, latar belakang)? Apa yang mereka butuhkan dari sesi ini? Mengapa mereka harus mendengarkanmu? Pembicara yang hebat menyesuaikan bahasa, contoh cerita, dan humor dengan karakteristik pendengarnya.",
            tip: "Gunakan analogi yang akrab di telinga audiensmu.",
          },
          {
            title: "4. Persiapan Dasar yang Efektif",
            body: "Persiapan 90% menentukan hasil. Jangan menghafal kata demi kata naskah, karena jika lupa satu kata kamu akan panik. Sebaliknya, pahami alur gagasan pokok (pointer) dan latih penyampaian secara lisan berulang kali hingga terdengar natural.",
            tip: "Berlatih di depan cermin atau rekam suaramu selama 60 detik secara konsisten.",
          }
        ]
      }),
      questions: [
        {
          order: 1,
          question: "Apa tujuan paling mendasar dari aktivitas public speaking?",
          optionA: "Menunjukkan kehebatan kosakata dan kecerdasan pribadi",
          optionB: "Menyampaikan pesan yang jelas dan bermanfaat bagi pendengar",
          optionC: "Menghafal naskah sepanjang mungkin tanpa jeda",
          optionD: "Mendominasi pembicaraan tanpa mempedulikan respon hadirin",
          correctAnswer: "B",
          explanation: "Public speaking berfokus pada penyampaian pesan yang jelas, terstruktur, dan memberi nilai manfaat bagi audiens.",
        },
        {
          order: 2,
          question: "Bagaimana cara menyikapi rasa gugup (stage fright) sebelum berbicara di depan umum?",
          optionA: "Menganggap gugup sebagai kegagalan dan membatalkan penampilan",
          optionB: "Meminum obat penenang tanpa petunjuk medis",
          optionC: "Mengalihkan energi adrenalin menjadi antusiasme dan melatih napas diafragma",
          optionD: "Berusaha keras menolak dan memikirkan kemungkinan terburuk",
          correctAnswer: "C",
          explanation: "Rasa gugup adalah respon alami yang dapat dikelola dengan pernapasan diafragma dan dialihkan menjadi energi positif.",
        },
        {
          order: 3,
          question: "Mengapa pembicara sebaiknya tidak menghafal naskah kata demi kata?",
          optionA: "Karena naskah tertulis dilarang oleh aturan umum berbicara",
          optionB: "Karena jika lupa satu kata, pembicara rentan panik dan kehilangan alur",
          optionC: "Karena menghafal membutuhkan waktu terlalu singkat",
          optionD: "Karena audiens dapat membaca pikiran pembicara",
          correctAnswer: "B",
          explanation: "Menghafal kata per kata membuat penyampaian kaku dan jika satu kata terlewat akan merusak kelancaran berbicara. Lebih baik memahami poin-poin utama.",
        },
        {
          order: 4,
          question: "Sebelum memulai presentasi, apa hal terpenting yang harus diketahui tentang audiens?",
          optionA: "Nama lengkap seluruh hadirin yang ada di ruangan",
          optionB: "Merek pakaian yang dikenakan para hadirin",
          optionC: "Latar belakang, kebutuhan, dan alasan mereka mendengarkan pesanmu",
          optionD: "Status ekonomi dan nomor kontak pribadi masing-masing",
          correctAnswer: "C",
          explanation: "Mengenali latar belakang dan kebutuhan audiens memungkinkan pembicara menyusun contoh dan gaya bahasa yang relevan.",
        },
        {
          order: 5,
          question: "Apa teknik pernapasan yang paling dianjurkan bagi pembicara untuk mengendalikan ketegangan?",
          optionA: "Pernapasan dada secara cepat dan pendek",
          optionB: "Menahan napas selama mungkin hingga berbicara",
          optionC: "Pernapasan diafragma secara perlahan dan teratur",
          optionD: "Bernapas melalui mulut secara terburu-buru",
          correctAnswer: "C",
          explanation: "Pernapasan diafragma memasok oksigen lebih optimal ke otak dan membantu memperlambat denyut jantung saat tegang.",
        },
        {
          order: 6,
          question: "Mindset apa yang paling sehat ditanamkan sebelum melangkah ke panggung?",
          optionA: "'Semua penonton sedang menunggu kesalahanku'",
          optionB: "'Aku harus terlihat sempurna tanpa ada kekurangan sedikit pun'",
          optionC: "'Audiens adalah rekan yang ingin belajar dan mendukung keberhasilanku'",
          optionD: "'Tidak masalah jika audiens bosan asalkan tugasku selesai'",
          correctAnswer: "C",
          explanation: "Melihat audiens sebagai pihak yang suportif menurunkan kecemasan sosial dan membangun kehangatan.",
        },
        {
          order: 7,
          question: "Metode persiapan berbicara yang menggunakan kartu pointer ringkas disebut...",
          optionA: "Metode Impromptu",
          optionB: "Metode Ekstemporan (Extemporaneous)",
          optionC: "Metode Naskah Penuh (Manuscript)",
          optionD: "Metode Menghafal (Memoriter)",
          correctAnswer: "B",
          explanation: "Metode ekstemporan menyusun garis besar dan poin kunci sehingga pembicara leluasa mengekspresikan kalimat secara alami.",
        },
        {
          order: 8,
          question: "Apa yang harus dilakukan jika saat berbicara kamu tiba-tiba lupa kalimat berikutnya?",
          optionA: "Langsung turun panggung dan meminta maaf berlebihan",
          optionB: "Tetap tenang, ambil jeda napas singkat 2-3 detik, dan lihat pointer atau rangkum kalimat sebelumnya",
          optionC: "Mengucapkan kata-kata sembarangan secepat mungkin",
          optionD: "Menyalahkan panitia atau mikrofon yang mati",
          correctAnswer: "B",
          explanation: "Jeda singkat (pause) terlihat wajar dan profesional bagi audiens, memberi waktu bagi pembicara untuk mengingat alur.",
        },
        {
          order: 9,
          question: "Mengapa kontak mata (eye contact) sangat penting dalam public speaking?",
          optionA: "Untuk mengintimidasi hadirin agar tidak ada yang berbicara sendiri",
          optionB: "Untuk membangun koneksi batin, rasa percaya, dan keterlibatan dengan audiens",
          optionC: "Agar pembicara tidak perlu melihat layar presentasi",
          optionD: "Hanya sebagai formalitas tanpa ada pengaruh emosional",
          correctAnswer: "B",
          explanation: "Kontak mata membuat audiens merasa dihargai dan diperhatikan secara personal oleh pembicara.",
        },
        {
          order: 10,
          question: "Manakah tindakan persiapan fisik yang dianjurkan 30 menit sebelum berbicara?",
          optionA: "Minum air es sebanyak mungkin dan mengonsumsi makanan berminyak",
          optionB: "Melakukan pemanasan rahang/artikulasi ringan dan meminum air putih suhu ruang",
          optionC: "Berteriak sekencang-kencangnya di tempat umum",
          optionD: "Begadang semalaman menghafal setiap kata",
          correctAnswer: "B",
          explanation: "Pemanasan rahang melenturkan organ vokal dan air suhu ruang menjaga kelembaban pita suara tanpa menyebabkan lendir.",
        },
      ],
    },
    {
      order: 2,
      title: "Teknik Berbicara",
      subtitle: "Vokal, Intonasi, Artikulasi, Tempo, Volume, dan Kekuatan Jeda",
      description: "Kuasai instrumen utamamu: suara! Pelajari bagaimana mengatur artikulasi yang jelas, variasi intonasi dinamis, kontrol tempo bicara, dan pemanfaatan jeda dramatis.",
      badge: {
        name: "Teknik Berbicara",
        description: "Menguasai teknik vokal, intonasi dinamis, kejelasan artikulasi, dan kontrol tempo.",
        icon: "mic",
      },
      content: JSON.stringify({
        summary: "Suara adalah instrumen musikmu dalam berbicara. Cara kamu mengucapkan kata-kata menentukan apakah audiens akan terhanyut atau justru mengantuk.",
        chapters: [
          {
            title: "1. Kejelasan Artikulasi dan Pelafalan",
            body: "Artikulasi adalah kejelasan dalam melafalkan setiap huruf dan suku kata (A-I-U-E-O). Banyak pembicara muda berbicara seperti bergumam karena bibir dan rahang tidak dibuka cukup lebar. Latihlah otot bibir dan lidah dengan latihan pelafalan vokal terbuka.",
            tip: "Buka mulutmu minimal selebar dua jari saat mengucapkan vokal 'A' untuk melatih proyeksi vokal.",
          },
          {
            title: "2. Intonasi Dinamis vs Nada Monoton",
            body: "Intonasi adalah lagu kalimat (naik-turunnya nada suara). Nada suara yang datar (monoton) adalah pembunuh fokus audiens nomor satu! Gunakan nada naik untuk bertanya atau memancing rasa penasaran, dan nada turun untuk menegaskan simpulan penting.",
            tip: "Beri penekanan (stressing) pada 1 atau 2 kata kunci dalam setiap kalimat utamamu.",
          },
          {
            title: "3. Mengendalikan Tempo (Pace)",
            body: "Rata-rata kecepatan bicara ideal dalam bahasa Indonesia adalah 120 - 150 kata per menit. Jangan berbicara terlalu cepat seolah dikejar waktu, dan jangan terlalu lambat hingga membuat audiens jenuh. Perlambat tempo pada bagian inti pesan, dan percepat sedikit pada bagian cerita yang seru.",
            tip: "Jika kamu merasa bicaramu terlalu cepat, itu tandanya kamu butuh mengambil jeda bernapas.",
          },
          {
            title: "4. Kekuatan Jeda (The Power of Pause)",
            body: "Jeda bukanlah kelemahan, melainkan senjata rahasia pembicara kelas dunia! Gunakan jeda 2 detik sebelum menyampaikan data mengejutkan, dan jeda 2 detik setelahnya agar audiens sempat mencerna bobot pesanmu. Jeda juga efektif menggantikan 'filler words' seperti 'ehmm...', 'aa...', 'anu...'.",
            tip: "Ketika hendak mengatakan 'eerr...', tutup mulutmu rapat-rapat dan biarkan hening bekerja.",
          }
        ]
      }),
      questions: [
        {
          order: 1,
          question: "Apa yang dimaksud dengan artikulasi dalam teknik vokal?",
          optionA: "Kecepatan menghitung jumlah kata dalam satu menit",
          optionB: "Kejelasan organ bicara dalam melafalkan huruf dan suku kata",
          optionC: "Tingginya nada suara saat berteriak",
          optionD: "Banyaknya bahasa asing yang digunakan dalam pidato",
          correctAnswer: "B",
          explanation: "Artikulasi mengacu pada ketepatan dan kejelasan pengucapan bunyi bahasa oleh organ vokal seperti lidah, bibir, dan langit-langit.",
        },
        {
          order: 2,
          question: "Apa akibat utama jika pembicara menggunakan intonasi yang datar (monoton)?",
          optionA: "Pesan tersampaikan jauh lebih ilmiah dan dapat dipercaya",
          optionB: "Audiens cepat merasa bosan, mengantuk, dan kehilangan minat mendengarkan",
          optionC: "Audiens akan mencatat seluruh isi materi dengan rapi",
          optionD: "Volume mikrofon akan menurun secara otomatis",
          correctAnswer: "B",
          explanation: "Suara tanpa variasi dinamika membuat otak audiens menganggap suara tersebut sebagai kebisingan latar yang membosankan.",
        },
        {
          order: 3,
          question: "Kapan saat terbaik bagi pembicara untuk memperlambat tempo bicaranya?",
          optionA: "Saat membacakan daftar hadir para peserta",
          optionB: "Saat menyampaikan gagasan utama, data penting, atau simpulan akhir",
          optionC: "Saat menyapa panitia di awal pembukaan",
          optionD: "Saat waktu presentasi sudah hampir habis",
          correctAnswer: "B",
          explanation: "Memperlambat tempo memberi bobot lebih dan memberi kesempatan bagi audiens untuk meresapi pesan penting.",
        },
        {
          order: 4,
          question: "Apa fungsi strategis dari penggunaan jeda (pause) setelah melontarkan pertanyaan reflektif?",
          optionA: "Memberi kesempatan bagi audiens untuk berpikir dan merenungkan pertanyaan tersebut",
          optionB: "Menunggu mikrofon dibenahi oleh panitia teknis",
          optionC: "Menunjukkan bahwa pembicara sedang bingung",
          optionD: "Memperlama durasi agar sesi tidak cepat berakhir",
          correctAnswer: "A",
          explanation: "Jeda setelah pertanyaan reflektif menciptakan momen kontemplasi aktif di pikiran audiens.",
        },
        {
          order: 5,
          question: "Apa cara paling efektif untuk menghilangkan kebiasaan 'filler words' (seperti: 'ehm', 'anu', 'kayak')?",
          optionA: "Berbicara lebih cepat tanpa berhenti bernapas",
          optionB: "Mengganti kata pengisi tersebut dengan hening (pause) sejenak",
          optionC: "Batuk setiap kali ingin mengucapkan kata tersebut",
          optionD: "Menghafal seluruh kamus bahasa Indonesia",
          correctAnswer: "B",
          explanation: "Keheningan singkat 1-2 detik terdengar matang dan berwibawa, jauh lebih baik daripada mengeluarkan suara gumaman.",
        },
        {
          order: 6,
          question: "Bagaimana cara melakukan penekanan kata (word stressing) yang tepat?",
          optionA: "Membaca seluruh kalimat dengan nada tinggi tanpa henti",
          optionB: "Memberikan intonasi berbeda atau volume sedikit lebih tegas pada kata kunci utama",
          optionC: "Memukul meja setiap kali menyelesaikan satu kalimat",
          optionD: "Mengulang kata yang sama sebanyak sepuluh kali berturut-turut",
          correctAnswer: "B",
          explanation: "Penekanan pada kata kunci memandu audiens memahami mana esensi pesan di antara kalimat pendukung.",
        },
        {
          order: 7,
          question: "Kecepatan bicara ideal dalam bahasa Indonesia untuk presentasi umum berkisar antara...",
          optionA: "50 - 70 kata per menit",
          optionB: "120 - 150 kata per menit",
          optionC: "250 - 300 kata per menit",
          optionD: "400 - 500 kata per menit",
          correctAnswer: "B",
          explanation: "120-150 kata per menit memberikan ritme yang nyaman, tidak terburu-buru namun tetap energik.",
        },
        {
          order: 8,
          question: "Apa yang membedakan antara 'volume suara' dengan 'berteriak'?",
          optionA: "Volume suara didukung oleh proyeksi napas diafragma, sedangkan berteriak membebani pita suara leher",
          optionB: "Volume suara hanya bisa dilakukan jika ada mikrofon kabel",
          optionC: "Tidak ada bedanya, keduanya sama-sama merusak tenggorokan",
          optionD: "Berteriak lebih sopan daripada menggunakan volume suara besar",
          correctAnswer: "A",
          explanation: "Proyeksi vokal menggunakan tenaga diafragma menghasilkan suara bulat dan lantang tanpa menyakiti tenggorokan.",
        },
        {
          order: 9,
          question: "Latihan 'Tongue Twister' (pelafalan kalimat rumit seperti 'Kakak koki kikir masak kakap') berguna untuk melatih...",
          optionA: "Kapasitas paru-paru saat berenang",
          optionB: "Kelenturan dan ketepatan artikulasi lidah dan bibir",
          optionC: "Kemampuan menghitung angka secara cepat",
          optionD: "Kekuatan mental menghadapi hujatan audiens",
          correctAnswer: "B",
          explanation: "Tongue twister melatih koordinasi motorik organ bicara agar lidah tidak mudah 'keseleo' saat berbicara cepat.",
        },
        {
          order: 10,
          question: "Nada suara akhir kalimat yang menurun (falling intonation) paling tepat digunakan untuk...",
          optionA: "Mengajukan pertanyaan yang membutuhkan konfirmasi",
          optionB: "Menyampaikan pernyataan tegas, kesimpulan, atau instruksi pasti",
          optionC: "Menunjukkan rasa ragu-ragu dan kebingungan",
          optionD: "Membuka sesi tebak-tebakan dengan penonton",
          correctAnswer: "B",
          explanation: "Nada menurun di akhir kalimat memberikan kesan kemantapan, kepastian, dan finalitas pada pernyataan.",
        },
      ],
    },
    {
      order: 3,
      title: "Struktur & Penyampaian",
      subtitle: "Pembukaan Memikat, Isi Berbobot, Transisi Mulus, dan Penutup Berkesan",
      description: "Pelajari bagaimana menyusun kerangka bicara yang terstruktur rapi. Buat pembukaan yang mencuri perhatian dalam 30 detik pertama, kembangkan poin utama dengan contoh nyata, dan tutup dengan call-to-action yang kuat.",
      badge: {
        name: "Struktur Pembicaraan",
        description: "Menguasai arsitektur pidato, pembukaan memikat, jembatan transisi, dan call-to-action.",
        icon: "layout",
      },
      content: JSON.stringify({
        summary: "Gagasan yang hebat bisa gagal dipahami jika strukturnya berantakan. Bangun bicaramu layaknya gedung kokoh: fondasi pembuka, pilar isi, dan atap penutup.",
        chapters: [
          {
            title: "1. 30 Detik Pertama: Pembukaan yang Memikat (Hook)",
            body: "Audiens memutuskan apakah akan memperhatikanmu atau memainkan ponsel mereka dalam 30 detik pertama. Hindari pembukaan klise yang bertele-tele. Mulailah dengan salah satu dari 4 teknik hook: pertanyaan provokatif, fakta mengejutkan, kutipan inspiratif, atau cerita mini yang relevan.",
            tip: "Jangan pernah mengawali pidato dengan meminta maaf atas kekurangan atau ketidaksiapanmu.",
          },
          {
            title: "2. Struktur Kerangka Isi (Metode Rule of Three)",
            body: "Pikiran manusia sangat menyukai pola tiga. Batasi isi pembicaraanmu menjadi 3 poin utama. Untuk setiap poin, gunakan rumus: Point (Gagasan), Reason (Alasan/Logika), Example (Contoh konkret atau cerita), Point (Penegasan kembali).",
            tip: "Tiga poin yang dibahas tuntas jauh lebih berkesan daripada sepuluh poin yang hanya disinggung sekilas.",
          },
          {
            title: "3. Jembatan Transisi Antargagasan",
            body: "Transisi adalah jembatan yang menghubungkan satu poin ke poin berikutnya agar bicaramu tidak terasa melompat-lompat. Gunakan kata penghubung alami seperti: 'Setelah kita memahami akarnya, mari kita lihat dampaknya...', atau 'Namun di balik tantangan tersebut, tersimpan satu peluang besar...'.",
            tip: "Gunakan transisi verbal yang disertai jeda napas singkat untuk menandai perpindahan topik.",
          },
          {
            title: "4. Penutup yang Menggerakkan (Call to Action)",
            body: "Bagian penutup adalah hal terakhir yang diingat oleh pendengarmu. Rangkum inti gagasanmu dalam satu kalimat emas. Kemudian, akhiri dengan Call to Action (ajakan bertindak yang jelas) yang membuat audiens terinspirasi untuk melakukan perubahan nyata setelah keluar dari ruangan.",
            tip: "Akhiri dengan kalimat penutup yang mantap, tatap seluruh audiens, dan biarkan tepuk tangan menyambutmu.",
          }
        ]
      }),
      questions: [
        {
          order: 1,
          question: "Mengapa 30 detik pertama penampilan sangat krusial bagi seorang pembicara?",
          optionA: "Karena setelah 30 detik lampu panggung akan dimatikan",
          optionB: "Karena pada momen tersebut audiens menentukan apakah akan fokus mendengarkan atau abai",
          optionC: "Karena mikrofon hanya bekerja optimal di 30 detik awal",
          optionD: "Karena panitia hanya menilai pada setengah menit pertama",
          correctAnswer: "B",
          explanation: "Rentang perhatian awal sangat menentukan keterlibatan emosional dan fokus audiens sepanjang sisa sesi.",
        },
        {
          order: 2,
          question: "Manakah contoh 'Hook' pembukaan yang paling memikat audiens?",
          optionA: "'Mohon maaf saya sebenarnya belum siap dan baru ditunjuk tadi pagi...'",
          optionB: "'Pernahkah Anda membayangkan apa jadinya jika satu kebiasaan kecil hari ini menyelamatkan masa depanmu?'",
          optionC: "'Tes satu dua tiga, apakah suara saya terdengar sampai belakang?'",
          optionD: "'Langsung saja kita mulai karena waktu kita sangat sempit hari ini.'",
          correctAnswer: "B",
          explanation: "Pertanyaan reflektif yang kuat memicu rasa penasaran dan langsung menghubungkan audiens dengan esensi topik.",
        },
        {
          order: 3,
          question: "Prinsip 'The Rule of Three' dalam menyusun poin materi menyarankan agar pembicara...",
          optionA: "Menyiapkan tiga naskah cadangan yang berbeda",
          optionB: "Membatasi gagasan utama pembahasan menjadi tiga pilar poin agar mudah diingat",
          optionC: "Mengulang setiap kata sebanyak tiga kali",
          optionD: "Berbicara tepat selama tiga jam tanpa istirahat",
          correctAnswer: "B",
          explanation: "Struktur tiga poin adalah pola kognitif yang paling mudah diproses dan diingat oleh memori manusia.",
        },
        {
          order: 4,
          question: "Dalam kerangka PREP (Point, Reason, Example, Point), apa fungsi dari bagian 'Example'?",
          optionA: "Sebagai formalitas untuk memenuhi jumlah halaman makalah",
          optionB: "Memberikan ilustrasi konkret atau bukti nyata agar gagasan terasa hidup dan masuk akal",
          optionC: "Menceritakan kehidupan orang lain yang tidak ada hubungannya dengan topik",
          optionD: "Menggantikan seluruh alasan logika pembicara",
          correctAnswer: "B",
          explanation: "Contoh atau studi kasus membuat konsep abstrak menjadi visual dan mudah dipahami pendengar.",
        },
        {
          order: 5,
          question: "Apa fungsi utama kalimat transisi dalam penyampaian materi?",
          optionA: "Memperpanjang durasi presentasi agar terlihat berwawasan",
          optionB: "Menghubungkan satu gagasan ke gagasan berikutnya agar alur terasa runtut dan mulus",
          optionC: "Mengalihkan perhatian ketika pembicara melakukan kesalahan data",
          optionD: "Mengganti judul presentasi di tengah pembicaraan",
          correctAnswer: "B",
          explanation: "Transisi bertindak sebagai kompas penunjuk jalan bagi audiens dalam mengikuti alur logika pembicara.",
        },
        {
          order: 6,
          question: "Manakah tindakan pembuka yang SANGAT dianjurkan untuk DIHINDARI?",
          optionA: "Mengucapkan salam dan senyum ramah",
          optionB: "Mengawali dengan permohonan maaf atas ketidaksiapan materi atau rasa gugup",
          optionC: "Menatap mata audiens dengan tenang",
          optionD: "Menyampaikan fakta data yang akurat",
          correctAnswer: "B",
          explanation: "Meminta maaf di awal meruntuhkan kredibilitas dan menurunkan ekspektasi audiens terhadap materi.",
        },
        {
          order: 7,
          question: "Apa yang dimaksud dengan 'Call to Action' (CTA) pada bagian penutup pidato?",
          optionA: "Perintah kepada panitia untuk segera membagikan konsumsi",
          optionB: "Ajakan atau seruan tindakan nyata yang diharapkan dilakukan oleh audiens setelah mendengar pesanmu",
          optionC: "Nomor telepon pembicara yang dipajang di layar akhir",
          optionD: "Tantangan berdebat dengan penonton yang tidak setuju",
          correctAnswer: "B",
          explanation: "Call to Action mengubah pemahaman teoretis menjadi dorongan aksi nyata yang bermakna.",
        },
        {
          order: 8,
          question: "Bagaimana cara merangkum materi pada bagian kesimpulan tanpa terdengar mengulang persis kata per kata?",
          optionA: "Membacakan ulang seluruh slide dari nomor satu",
          optionB: "Menyuling pesan inti menjadi satu kalimat pesan kunci (takeaway message) yang kuat",
          optionC: "Menyuruh salah satu penonton maju ke depan untuk menyimpulkan",
          optionD: "Menghilangkan bagian penutup dan langsung mengucap salam",
          correctAnswer: "B",
          explanation: "Pesan kunci yang ringkas dan padat menjadi 'oleh-oleh' berharga yang dibawa pulang oleh audiens.",
        },
        {
          order: 9,
          question: "Struktur pidato klasik yang paling efektif terdiri dari tiga bagian utama, yaitu...",
          optionA: "Pembukaan, Pembahasan Isi, dan Penutup",
          optionB: "Sapaan, Iklan Sponsor, dan Tanya Jawab",
          optionC: "Perkenalan Diri, Foto Bersama, dan Ramah Tamah",
          optionD: "Naskah A, Naskah B, dan Naskah Cadangan",
          correctAnswer: "A",
          explanation: "Pembukaan (Introduction), Isi (Body), dan Penutup (Conclusion) adalah arsitektur universal komunikasi yang teruji.",
        },
        {
          order: 10,
          question: "Apa tanda bahwa struktur bicaramu berhasil dipahami dengan baik oleh audiens?",
          optionA: "Audiens langsung meninggalkan ruangan sebelum salam",
          optionB: "Audiens mampu menceritakan kembali ide pokok bicaramu kepada orang lain dengan mudah",
          optionC: "Tidak ada seorang pun yang berani bertanya di akhir sesi",
          optionD: "Ruangan menjadi sangat sunyi karena semua orang tertidur",
          correctAnswer: "B",
          explanation: "Kejelasan struktur tercermin dari seberapa mudah gagasan tersebut direplikasi dan diingat oleh audiens.",
        },
      ],
    },
    {
      order: 4,
      title: "MC & Sambutan",
      subtitle: "Protokoler Acara, Bahasa Baku & Hangat, Menghidupkan Suasana, dan Berpidato Mewakili Peran",
      description: "Pelajari keterampilan praktis menjadi Master of Ceremony (MC) profesional dan membawakan kata sambutan yang elegan, mulai dari tata urutan protokoler, teknik bridging antarsesi, hingga etika menyebut tamu kehormatan.",
      badge: {
        name: "MC & Sambutan",
        description: "Menguasai keterampilan memandu acara resmi/semi-formal dan membawakan kata sambutan berwibawa.",
        icon: "mic-2",
      },
      content: JSON.stringify({
        summary: "MC adalah kapten kapal yang menjaga nyawa sebuah acara. Sedangkan pemberi sambutan adalah duta yang menyampaikan pesan kehormatan dan tujuan bersama.",
        chapters: [
          {
            title: "1. Peran dan Tanggung Jawab Master of Ceremony (MC)",
            body: "MC bertugas mengendalikan waktu (time-keeper), menghidupkan energi ruangan (atmosphere creator), dan menghubungkan setiap segmen acara (bridging). MC yang baik tidak mencuri panggung dari pengisi acara utama, melainkan membuat seluruh pengisi acara bersinar di mata hadirin.",
            tip: "Pegang cue card dengan satu tangan di dada atas agar postur tetap tegap dan mata mudah berpindah ke audiens.",
          },
          {
            title: "2. Protokoler dan Penghormatan Tamu",
            body: "Dalam acara resmi (formal), urutan penghormatan tamu dimulai dari pejabat/tamu tertinggi ke yang lebih rendah ('Yang terhormat Bapak Bupati..., Yang kami hormati Kepala Dinas...'). Sedangkan urutan memberikan sambutan biasanya berkebalikan: dari level ketua panitia pelaksana hingga diakhiri oleh pejabat tertinggi yang sekaligus membuka acara.",
            tip: "Verifikasi pelafalan nama, gelar akademik, dan jabatan tamu kepada panitia sebelum acara dimulai.",
          },
          {
            title: "3. Seni 'Bridging' (Transisi Antarsesi)",
            body: "Bridging adalah seni menghubungkan sesi yang baru saja selesai dengan sesi yang akan datang agar acara mengalir harmonis. Jangan hanya berkata: 'Acara berikutnya adalah...'. Berikan komentar apresiatif singkat atas penampilan sebelumnya sebelum mengundang sesi selanjutnya.",
            tip: "Dengarkan apa yang disampaikan pengisi acara agar kamu bisa membuat bridging yang kontekstual.",
          },
          {
            title: "4. Struktur Kata Sambutan yang Elegan",
            body: "Sambutan yang baik tidak bertele-tele (ideal 3 - 5 menit). Strukturnya: Salam hormat kepada tamu dan hadirin, ungkapan syukur, konteks acara dan apresiasi panitia, 2 pesan/harapan utama, serta penutup dan doa restu.",
            tip: "Fokuslah pada apresiasi kerja keras tim dan visi ke depan, bukan keluhan teknis.",
          }
        ]
      }),
      questions: [
        {
          order: 1,
          question: "Apa tugas paling fundamental dari seorang Master of Ceremony (MC)?",
          optionA: "Menjadi bintang utama dan mendominasi seluruh pembicaraan",
          optionB: "Mengatur ritme waktu, menghidupkan suasana, dan memandu alur acara dari awal hingga akhir",
          optionC: "Mengambil alih materi yang seharusnya disampaikan narasumber",
          optionD: "Membagikan doorprize tanpa izin panitia",
          correctAnswer: "B",
          explanation: "MC adalah pengendali jalannya acara yang memastikan setiap agenda terlaksana sesuai susunan dengan energi yang terjaga.",
        },
        {
          order: 2,
          question: "Dalam etika protokoler formal di Indonesia, sebutan 'Yang terhormat' ditujukan kepada...",
          optionA: "Seluruh peserta yang hadir tanpa terkecuali",
          optionB: "Satu orang tamu dengan kedudukan/jabatan tertinggi di acara tersebut",
          optionC: "Semua pengisi acara hiburan",
          optionD: "Petugas kebersihan ruangan",
          correctAnswer: "B",
          explanation: "Secara protokoler formal, 'Yang terhormat' umumnya hanya digunakan untuk satu orang tamu paling utama/tertinggi, sementara yang lainnya disapa 'Yang kami hormati'.",
        },
        {
          order: 3,
          question: "Dalam susunan acara resmi, bagaimanakah urutan pemberian kata sambutan yang lazim?",
          optionA: "Dimulai dari pejabat tertinggi terlebih dahulu baru ketua panitia",
          optionB: "Dimulai dari ketua panitia pelaksana, diikuti pihak berwenang, dan diakhiri pejabat tertinggi yang membuka acara",
          optionC: "Secara acak berdasarkan siapa yang datang lebih dulu",
          optionD: "Sambutan disampaikan bersamaan di satu mikrofon",
          correctAnswer: "B",
          explanation: "Urutan sambutan bergerak dari tingkat pelaksana terendah menuju pejabat tertinggi yang memberikan arahan pamungkas/peresmian.",
        },
        {
          order: 4,
          question: "Apa yang dimaksud dengan teknik 'Bridging' bagi seorang MC?",
          optionA: "Membangun panggung fisik sebelum acara dimulai",
          optionB: "Menghubungkan dua agenda acara dengan komentar apresiatif dan transisi yang halus",
          optionC: "Membacakan seluruh sponsor acara tanpa henti",
          optionD: "Menyanyi saat pengisi acara belum siap",
          correctAnswer: "B",
          explanation: "Bridging membuat perpindahan antarsesi terasa wajar, menyatu, dan tidak kaku.",
        },
        {
          order: 5,
          question: "Berapa durasi ideal untuk membawakan kata sambutan agar audiens tetap fokus dan tidak jenuh?",
          optionA: "Antara 3 hingga 5 menit",
          optionB: "Minimal 30 menit",
          optionC: "Di atas 1 jam",
          optionD: "Kurang dari 10 detik",
          correctAnswer: "A",
          explanation: "3 hingga 5 menit adalah durasi optimal yang cukup padat untuk menyampaikan salam, apresiasi, dan pesan utama.",
        },
        {
          order: 6,
          question: "Bagaimana cara memegang kartu panduan (cue card) yang profesional bagi MC?",
          optionA: "Menutup seluruh wajah agar rasa gugup tidak terlihat",
          optionB: "Dipegang di depan dada bagian atas dengan posisi rileks sehingga kontak mata tetap leluasa",
          optionC: "Diselipkan di saku celana sepanjang acara",
          optionD: "Diletakkan di lantai panggung",
          correctAnswer: "B",
          explanation: "Memegang cue card setinggi dada memudahkan lirik singkat tanpa harus menundukkan kepala terlalu dalam.",
        },
        {
          order: 7,
          question: "Apa tindakan terbaik MC jika narasumber utama terlambat hadir di lokasi acara?",
          optionA: "Mengumumkan bahwa acara dibatalkan dan menyuruh penonton pulang",
          optionB: "Tetap tenang, berkoordinasi dengan panitia, dan mengisi waktu dengan interaksi ringan, ice breaking, atau menukar agenda",
          optionC: "Memarahi narasumber di depan seluruh hadirin melalui pengeras suara",
          optionD: "Meninggalkan panggung kosong tanpa penjelasan",
          correctAnswer: "B",
          explanation: "Fleksibilitas dan kemampuan improvisasi menjaga ketenangan audiens saat terjadi kendala teknis tak terduga.",
        },
        {
          order: 8,
          question: "Pemberi sambutan mewakili panitia sebaiknya memfokuskan pesannya pada...",
          optionA: "Menyampaikan laporan ucapan terima kasih kepada pihak pendukung serta harapan manfaat acara",
          optionB: "Mengeluh tentang betapa susahnya mencari dana sponsor",
          optionC: "Membacakan riwayat hidup pribadinya secara mendalam",
          optionD: "Membahas masalah politik yang tidak ada sangkut pautnya",
          correctAnswer: "A",
          explanation: "Ketua panitia bertugas menyambut hadirin, mengapresiasi kerja tim dan sponsor, serta menegaskan maksud kegiatan.",
        },
        {
          order: 9,
          question: "Manakah gaya bahasa yang paling tepat untuk MC dalam acara 'Workshop Kreatif Pemuda' semi-formal?",
          optionA: "Sangat kaku layaknya upacara kenegaraan militer",
          optionB: "Hangat, komunikatif, sopan, namun tetap berenergi positif",
          optionC: "Menggunakan kata-kata kasar agar dianggap akrab",
          optionD: "Sepenuhnya menggunakan bahasa asing tanpa terjemahan",
          correctAnswer: "B",
          explanation: "Acara semi-formal memerlukan kehangatan dan interaktivitas yang ramah tanpa melupakan etika kesopanan.",
        },
        {
          order: 10,
          question: "Sebelum acara resmi dimulai, hal penting apa yang wajib dikonfirmasi oleh MC kepada panitia?",
          optionA: "Warna sepatu yang dipakai para tamu",
          optionB: "Kebenaran penulisan nama lengkap, gelar kehormatan, dan jabatan tamu penting",
          optionC: "Menu makanan panitia setelah acara selesai",
          optionD: "Merk generator listrik yang digunakan gedung",
          correctAnswer: "B",
          explanation: "Salah melafalkan nama atau gelar pejabat merupakan kesalahan fatal dalam etika protokoler formal.",
        },
      ],
    },
    {
      order: 5,
      title: "Improvisasi & Praktik",
      subtitle: "Bicara Spontan (Impromptu), Menghadapi Kejadian Tak Terduga, dan Mental Juara",
      description: "Tingkat tertinggi public speaking: berpikir cepat dan berbicara spontan tanpa persiapan panjang. Kuasai rumus impromptu (PAST-PRESENT-FUTURE, PREP), kendalikan situasi darurat di panggung, dan bangun jam terbang konsisten.",
      badge: {
        name: "Jago Bicara",
        description: "Menuntaskan seluruh kurikulum JAGO BICARA dan siap berbicara percaya diri dalam berbagai situasi.",
        icon: "trophy",
      },
      content: JSON.stringify({
        summary: "Di dunia nyata, kesempatan berbicara seringkali datang mendadak tanpa naskah. Pembicara yang jago adalah mereka yang mampu mengorganisir ide dalam hitungan detik dan menyampaikannya dengan penuh ketenangan.",
        chapters: [
          {
            title: "1. Seni Bicara Spontan (Metode Impromptu)",
            body: "Ketika diminta mendadak berbicara ('Boleh minta tanggapan dari Mas Ahmad?'), jangan pernah berkata 'Aduh, saya bingung mau ngomong apa'. Ambil jeda 3 detik, tarik napas, dan gunakan rumus instan. Otakmu membutuhkan kerangka logika darurat untuk menyusun argumen.",
            tip: "Tersenyumlah saat namamu dipanggil; senyum memberi waktu 2 detik bagi otakmu untuk berpikir jernih.",
          },
          {
            title: "2. Rumus Instan: Waktu (Past - Present - Future)",
            body: "Struktur waktu adalah cara termudah merespon topik apa pun secara spontan. Ceritakan bagaimana kondisinya di MASA LALU (Past), bagaimana keadaan yang kita hadapi SEKARANG (Present), dan apa harapan atau langkah nyata di MASA DEPAN (Future).",
            tip: "Rumus ini sangat cocok untuk tema evaluasi kegiatan, perpisahan, atau sambutan dadakan.",
          },
          {
            title: "3. Menghadapi Situasi Darurat di Panggung",
            body: "Mikrofon mati tiba-tiba? Proyektor mati? Kamu terpeleset? Pembicara amatir akan panik dan meminta maaf berkali-kali. Pembicara profesional tersenyum, menjadikannya lelucon ringan yang mencairkan suasana, dan terus melanjutkan dengan vokal lantang.",
            tip: "Ketika ada insiden tak terduga, jangan disembunyikan. Akui dengan santai dan bawa kembali fokus ke pesan.",
          },
          {
            title: "4. Membangun Jam Terbang dan Kebiasaan Praktik",
            body: "Teori tanpa praktik adalah sia-sia. Keberanian sejati hanya tumbuh dari jam terbang. Latihlah bicaramu selama 60 detik setiap hari di fitur 'Bicara' JAGO BICARA, ikuti diskusi komunitas, dan jangan pernah melewatkan kesempatan saat ditawari berbicara.",
            tip: "Konsistensi kecil setiap hari akan mengubah rasa takutmu menjadi rasa percaya diri abadi.",
          }
        ]
      }),
      questions: [
        {
          order: 1,
          question: "Apa respon spontan terbaik ketika namamu tiba-tiba ditunjuk untuk berbicara tanpa persiapan?",
          optionA: "Menolak sambil menutupi wajah dan berkata 'Saya tidak bisa'",
          optionB: "Tersenyum tenang, mengambil napas sejenak, menerima kesempatan, dan menggunakan rumus struktur sederhana",
          optionC: "Mengeluh kepada hadirin bahwa penunjukan ini tidak adil",
          optionD: "Pura-pura batuk dan keluar ruangan terburu-buru",
          correctAnswer: "B",
          explanation: "Sikap tenang dan penerimaan positif membangun rasa percaya diri di hadapan audiens sebelum kata pertama diucapkan.",
        },
        {
          order: 2,
          question: "Bagaimanakah alur kerangka berpikir impromptu 'Past - Present - Future'?",
          optionA: "Membahas apa yang terjadi di masa lalu, situasi saat ini, dan harapan atau rencana di masa depan",
          optionB: "Menebak masa depan ramalan nasib audiens",
          optionC: "Menghafal sejarah sejak abad ke-15 hingga kiamat",
          optionD: "Membicarakan masa depan terlebih dahulu baru menyalahkan masa lalu",
          correctAnswer: "A",
          explanation: "Alur kronologis Past-Present-Future adalah cara paling logis dan mudah disusun secara instan di kepala pembicara.",
        },
        {
          order: 3,
          question: "Jika mikrofon tiba-tiba mati saat kamu sedang berbicara di tengah ruangan sedang, apa respon profesionalmu?",
          optionA: "Langsung diam membisu menunggu panitia membawakan mikrofon baru",
          optionB: "Melangkah maju sedikit, memproyeksikan vokal dengan napas diafragma agar suara menjangkau ruangan, sambil memberi kode ramah pada kru",
          optionC: "Memukul-mukul mikrofon ke meja berkali-kali",
          optionD: "Menyalahkan soundman di hadapan seluruh peserta",
          correctAnswer: "B",
          explanation: "Menggunakan suara asli dengan proyeksi diafragma menunjukkan profesionalisme dan ketahanan kendali panggung.",
        },
        {
          order: 4,
          question: "Metode 'PREP' sangat berguna untuk menjawab pertanyaan spontan dalam sesi tanya jawab. Apa kepanjangan PREP?",
          optionA: "People, Resource, Economy, Program",
          optionB: "Point, Reason, Example, Point",
          optionC: "Problem, Reaction, Emotion, Panic",
          optionD: "Past, Right, Explain, Pause",
          correctAnswer: "B",
          explanation: "Point (Gagasan), Reason (Alasan), Example (Contoh/Bukti), Point (Penegasan Kesimpulan) adalah rumus argumentasi efektif.",
        },
        {
          order: 5,
          question: "Bagaimana cara menyikapi audiens yang terlihat sibuk memainkan ponsel saat kamu berbicara?",
          optionA: "Menyindir dan mempermalukan orang tersebut di depan umum",
          optionB: "Mengubah dinamika bicara: gunakan jeda mendadak, ajukan pertanyaan terbuka, atau bergerak mendekati area tersebut",
          optionC: "Marah dan menghentikan presentasi secara sepihak",
          optionD: "Ikut memainkan ponsel di atas panggung",
          correctAnswer: "B",
          explanation: "Perubahan dinamika vokal atau pergerakan tubuh secara halus menarik kembali kesadaran pendengar tanpa permusuhan.",
        },
        {
          order: 6,
          question: "Apa arti dari 'mindset panggung adalah laboratorium' bagi seorang pembicara muda?",
          optionA: "Setiap penampilan adalah ajang eksperimen untuk belajar dan berkembang, bukan penghakiman hidup-mati",
          optionB: "Pembicara harus membawa jas laboratorium saat berpidato",
          optionC: "Pidato hanya boleh dilakukan di dalam ruangan sains",
          optionD: "Kegagalan berbicara berarti kamu tidak memiliki bakat sama sekali",
          correctAnswer: "A",
          explanation: "Memandang panggung sebagai ruang belajar membebaskan kita dari beban kesempurnaan palsu.",
        },
        {
          order: 7,
          question: "Berapa lama jeda hening alami yang bisa kamu manfaatkan untuk mengumpulkan pikiran saat ditanya mendadak?",
          optionA: "1 hingga 3 detik",
          optionB: "10 menit",
          optionC: "Setengah jam",
          optionD: "Tidak boleh ada jeda sama sekali walau sedetik",
          correctAnswer: "A",
          explanation: "Jeda 1-3 detik terlihat sebagai tanda kebijaksanaan dan kehati-hatian dalam berpikir bagi audiens.",
        },
        {
          order: 8,
          question: "Jika salah seorang hadirin mengajukan pertanyaan sulit yang belum kamu ketahui jawabannya secara pasti, apa yang harus kamu lakukan?",
          optionA: "Mengarang jawaban palsu dengan meyakinkan agar tidak malu",
          optionB: "Mengapresiasi pertanyaannya, mengakui secara jujur bahwa kamu perlu memverifikasi data tersebut, dan menawarkan follow-up setelah sesi",
          optionC: "Menyerang balik si penanya dengan kata-kata kasar",
          optionD: "Pura-pura tidak mendengar pertanyaan tersebut",
          correctAnswer: "B",
          explanation: "Kejujuran intelektual mempertahankan integritas dan rasa hormat audiens terhadap kepribadian pembicara.",
        },
        {
          order: 9,
          question: "Mengapa latihan berbicara 60 detik setiap hari di fitur 'Bicara' sangat ampuh melatih refleks otak?",
          optionA: "Karena membatasi waktu melatih otak memilah inti gagasan secara cepat dan terarah",
          optionB: "Karena manusia hanya memiliki rentang memori selama 60 detik",
          optionC: "Hanya untuk menghabiskan kuota internet harian",
          optionD: "Agar pengguna tidak perlu membaca buku lagi",
          correctAnswer: "A",
          explanation: "Batasan 60 detik memaksa pembicara berpikir ringkas, fokus pada pesan kunci, dan menghindari pembicaraan berputar-putar.",
        },
        {
          order: 10,
          question: "Apa kunci terpenting agar seseorang benar-benar menjadi 'Jago Bicara' seumur hidup?",
          optionA: "Memiliki garis keturunan orator terkenal",
          optionB: "Konsistensi berlatih secara berkesinambungan dan keberanian untuk terus mencoba tanpa takut salah",
          optionC: "Membeli mikrofon paling mahal di pasaran",
          optionD: "Hanya berteori tanpa pernah berbicara di depan orang lain",
          correctAnswer: "B",
          explanation: "Konsistensi latihan dan keberanian untuk terus melangkah adalah penentu utama kemahiran berbicara yang sejati.",
        },
      ],
    },
  ];

  for (const mod of modulesData) {
    const createdModule = await prisma.module.create({
      data: {
        order: mod.order,
        title: mod.title,
        subtitle: mod.subtitle,
        description: mod.description,
        content: mod.content,
      },
    });

    // Create Badge for module
    await prisma.badge.create({
      data: {
        name: mod.badge.name,
        description: mod.badge.description,
        icon: mod.badge.icon,
        moduleId: createdModule.id,
      },
    });

    // Create 10 Quiz Questions for module
    for (const q of mod.questions) {
      await prisma.quizQuestion.create({
        data: {
          moduleId: createdModule.id,
          order: q.order,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        },
      });
    }
  }

  console.log("Seeded 5 modules with 50 quiz questions and 5 badges.");

  // 9. Seed some module progress for demo participants
  // Give Ahmad progress on Module 1 (completed), Module 2 (completed), Module 3 (in progress)
  const allModules = await prisma.module.findMany({ orderBy: { order: "asc" } });
  const allBadges = await prisma.badge.findMany();

  // Ahmad completed Module 1 & 2
  await prisma.moduleProgress.create({
    data: {
      userId: participantUsers[0].id,
      moduleId: allModules[0].id,
      isCompleted: true,
      quizScore: 10,
      attemptsCount: 1,
      completedAt: new Date(Date.now() - 3 * 86400000),
    },
  });
  await prisma.userBadge.create({
    data: {
      userId: participantUsers[0].id,
      badgeId: allBadges.find((b) => b.moduleId === allModules[0].id).id,
    },
  });

  await prisma.moduleProgress.create({
    data: {
      userId: participantUsers[0].id,
      moduleId: allModules[1].id,
      isCompleted: true,
      quizScore: 10,
      attemptsCount: 2,
      completedAt: new Date(Date.now() - 86400000),
    },
  });
  await prisma.userBadge.create({
    data: {
      userId: participantUsers[0].id,
      badgeId: allBadges.find((b) => b.moduleId === allModules[1].id).id,
    },
  });

  // Nabila completed Module 1
  await prisma.moduleProgress.create({
    data: {
      userId: participantUsers[1].id,
      moduleId: allModules[0].id,
      isCompleted: true,
      quizScore: 10,
      attemptsCount: 1,
      completedAt: new Date(Date.now() - 2 * 86400000),
    },
  });
  await prisma.userBadge.create({
    data: {
      userId: participantUsers[1].id,
      badgeId: allBadges.find((b) => b.moduleId === allModules[0].id).id,
    },
  });

  // 10. Seed Script Templates
  await prisma.scriptTemplate.createMany({
    data: [
      {
        type: "MC",
        name: "Template MC Acara Formal Protokoler",
        category: "Formal",
        description: "Template pembawa acara resmi kenegaraan, seminar akademik, atau pelantikan organisasi.",
        templateBody: "Format MC resmi dengan salam nasional, penghormatan hirarki pejabat, susunan acara berurutan, dan bridging protokoler.",
      },
      {
        type: "MC",
        name: "Template MC Acara Semi-Formal Hangat",
        category: "Semi-formal",
        description: "Template pembawa acara workshop, talkshow, gathering komunitas, atau perayaan pemuda.",
        templateBody: "Format MC santai namun teratur, menyapa hadirin secara interaktif, dan menciptakan energi positif.",
      },
      {
        type: "SAMBUTAN",
        name: "Template Sambutan Ketua Panitia",
        category: "Formal",
        description: "Kata sambutan ringkas untuk membuka acara, mengapresiasi panitia, dan menyapa tamu.",
        templateBody: "Format sambutan ketua pelaksana dengan fokus rasa syukur, apresiasi tim, dan harapan kebermanfaatan.",
      },
      {
        type: "MODERATOR",
        name: "Template Pemandu Diskusi & Seminar",
        category: "Semi-formal",
        description: "Panduan lengkap bagi moderator dari pembukaan, pengenalan CV pemateri, hingga tanya jawab.",
        templateBody: "Format pemandu diskusi dengan aturan main sesi, pengantar tema, dan transisi tanya-jawab.",
      },
      {
        type: "PRESENTASI",
        name: "Template Pidato Inspiratif & Presentasi Gagasan",
        category: "Semi-formal",
        description: "Kerangka presentasi persuasif menggunakan formula Hook, Rule of Three, dan Call to Action.",
        templateBody: "Format presentasi gagasan berbobot yang menggerakkan pendengar melakukan aksi nyata.",
      },
    ],
  });

  console.log("Seeded script templates.");
  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
