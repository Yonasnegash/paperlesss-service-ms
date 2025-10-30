function generateCustomID(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const idFormat = [8, 4, 4, 4, 12];

  let id = '';

  idFormat.forEach((length, index) => {
      for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * chars.length);
          id += chars[randomIndex];
      }
      if (index < idFormat.length - 1) {
          id += '-';
      }
  });

  return id;
}

export default generateCustomID;
