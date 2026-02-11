const db = require('./database');

class User {
  // Create or update user from Telegram auth
  static async findOrCreateFromTelegram(telegramData) {
    return new Promise((resolve, reject) => {
      const { id, username, first_name, last_name, photo_url } = telegramData;

      // First try to find existing user
      db.get(
        'SELECT * FROM users WHERE telegram_id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          if (row) {
            // Update existing user
            db.run(
              `UPDATE users SET
               username = ?, first_name = ?, last_name = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
               WHERE telegram_id = ?`,
              [username, first_name, last_name, photo_url, id],
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve({ ...row, username, first_name, last_name, avatar_url });
                }
              }
            );
          } else {
            // Create new user
            db.run(
              `INSERT INTO users (telegram_id, username, first_name, last_name, avatar_url)
               VALUES (?, ?, ?, ?, ?)`,
              [id, username, first_name, last_name, photo_url],
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    id: this.lastID,
                    telegram_id: id,
                    username,
                    first_name,
                    last_name,
                    avatar_url: photo_url
                  });
                }
              }
            );
          }
        }
      );
    });
  }

  // Find user by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Find user by Telegram ID
  static async findByTelegramId(telegramId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE telegram_id = ?', [telegramId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

module.exports = User;