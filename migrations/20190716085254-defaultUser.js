module.exports = {
  up(db) {
    return db.collection('users').insertMany([
      {
        email: 'default@gmail.com',
        password:
          '$2a$10$NrchS0idG1zU679unFfohuL4.VPjRMJse00LrKREWozH.kteRdXYW',
      },
    ]);
  },
  down(db) {
    return db.collection('users').deleteOne({ email: 'default@gmail.com' });
  },
};
