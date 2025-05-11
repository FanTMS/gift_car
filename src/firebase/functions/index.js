const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Инициализируем Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function для генерации кастомного токена аутентификации Firebase
 * на основе Telegram ID пользователя
 * 
 * Эта функция ищет пользователя в Firestore по его Telegram ID,
 * и если находит, генерирует кастомный токен для входа через Firebase Auth
 */
exports.generateAuthToken = functions.https.onCall(async (data, context) => {
  try {
    // Проверяем, что передан telegramId
    const { telegramId } = data;
    if (!telegramId) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'Запрос должен содержать telegramId'
      );
    }

    // Ищем пользователя по telegramId в коллекции users
    const usersRef = admin.firestore().collection('users');
    const querySnapshot = await usersRef.where('telegramId', '==', telegramId.toString()).get();

    let userId;
    let userData;

    if (querySnapshot.empty) {
      // Если пользователь не найден, создаем нового
      const newUserRef = usersRef.doc();
      userId = newUserRef.id;
      
      // Создаем базовый профиль
      userData = {
        telegramId: telegramId.toString(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await newUserRef.set(userData);
    } else {
      // Берем существующего пользователя
      const userDoc = querySnapshot.docs[0];
      userId = userDoc.id;
      userData = userDoc.data();
      
      // Обновляем время последнего входа
      await userDoc.ref.update({
        lastLogin: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Проверяем, существует ли уже пользователь в Firebase Auth
    try {
      await admin.auth().getUser(userId);
    } catch (error) {
      // Если пользователя нет в Auth, создаем запись
      if (error.code === 'auth/user-not-found') {
        await admin.auth().createUser({
          uid: userId,
          displayName: userData.displayName || 'Пользователь Telegram',
          photoURL: userData.photoURL || null,
        });
      } else {
        throw error;
      }
    }

    // Генерируем кастомный токен
    const token = await admin.auth().createCustomToken(userId, {
      telegramId: telegramId.toString()
    });

    return { token };
  } catch (error) {
    console.error('Error generating auth token:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Ошибка при генерации токена авторизации'
    );
  }
}); 