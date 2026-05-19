// Auto-generated. Verifies seeded credentials against repository hashes.
  const bcrypt = require('/home/runner/workspace/backend/node_modules/bcryptjs');
  const cases = [
    { user: 'admin@vault16.ec',  pwd: 'Vault16Admin!', hash: "$2a$10$WpjGKkMYFPUD2qu6q6mS4.MPq3BZ3XAUzp.BB7ERLCHnO57OkX6He" },
    { user: 'test@vault16.ec',   pwd: 'Vault16Test!',  hash: "$2a$10$d1valDjZSQNh4MLYHOg1eOQb5uygw76w0bcT6ZUz2pwm08bLm9If2" },
  ];
  let ok = true;
  for (const c of cases) {
    const r = bcrypt.compareSync(c.pwd, c.hash);
    console.log(`${r ? '✅' : '❌'} ${c.user.padEnd(24)} → ${c.pwd}`);
    if (!r) ok = false;
  }
  process.exit(ok ? 0 : 1);
  