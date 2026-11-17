import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<username>')) {
      console.warn('⚠️ MONGODB_URI belum dikonfigurasi dengan kredensial Atlas yang valid di .env');
      console.warn('⚠️ Backend akan tetap berjalan dengan Real-time RAM Engine (In-Memory).');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true // Memastikan index timestamp otomatis dibuat
    });

    console.log(`🍃 MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error Database Connection: ${error.message}`);
    // Jika koneksi gagal, berikan opsi untuk tidak langsung crash di environment development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️ Server tetap berjalan dalam mode RAM cache tanpa MongoDB Atlas.');
    }
  }
};

