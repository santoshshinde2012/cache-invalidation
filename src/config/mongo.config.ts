export default () => ({
  mongo: {
    uri:
      process.env.MONGODB_URI ||
      'mongodb://root:rootpassword@localhost:27017/database?authSource=admin&replicaSet=rs0',
  },
});
