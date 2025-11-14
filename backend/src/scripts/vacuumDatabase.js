import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

async function vacuumDatabase() {
  try {
    console.log('🔧 Starting database maintenance...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Run VACUUM ANALYZE to clean up and optimize
    console.log('🧹 Running VACUUM ANALYZE...');
    await sequelize.query('VACUUM ANALYZE;');
    console.log('✅ VACUUM ANALYZE completed');

    // Check database statistics
    console.log('📊 Checking database statistics...');
    const [stats] = await sequelize.query(`
      SELECT
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables
      ORDER BY n_dead_tup DESC;
    `);

    console.log('\n📈 Table Statistics:');
    console.table(stats);

    // Check WAL files
    console.log('\n📁 Checking WAL files...');
    const [walStats] = await sequelize.query(`
      SELECT
        pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')) as wal_size,
        pg_current_wal_lsn() as current_wal_lsn;
    `);
    console.log('WAL Info:', walStats[0]);

    // Check database size
    console.log('\n💾 Checking database size...');
    const [dbSize] = await sequelize.query(`
      SELECT
        pg_size_pretty(pg_database_size(current_database())) as database_size;
    `);
    console.log('Database Size:', dbSize[0]);

    console.log('\n✅ Database maintenance completed successfully!');

  } catch (error) {
    console.error('❌ Database maintenance failed:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the vacuum
vacuumDatabase()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
