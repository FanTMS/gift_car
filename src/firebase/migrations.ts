import { db } from './config';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc,
  setDoc,
  Timestamp 
} from 'firebase/firestore';
import { Raffle, Company, CarFeature } from '../types';

/**
 * Миграция для обновления структуры данных в Firebase
 * Этот скрипт можно запустить один раз для обновления данных или настройки первоначальной структуры
 */
export const runMigrations = async () => {
  console.log('Starting database migrations...');
  
  try {
    await updateRafflesSchema();
    await ensureCarFeaturesCollection();
    await updateCompaniesSchema();
    
    console.log('Migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    return false;
  }
};

/**
 * Обновление структуры данных розыгрышей
 */
const updateRafflesSchema = async () => {
  console.log('Updating raffles schema...');
  
  const rafflesCollection = collection(db, 'raffles');
  const snapshot = await getDocs(rafflesCollection);
  
  const updatePromises = snapshot.docs.map(async (docSnapshot) => {
    const raffleData = docSnapshot.data() as Raffle;
    const raffleId = docSnapshot.id;
    const updates: Record<string, any> = {};
    
    // Проверяем наличие поля carSpecifications и добавляем его, если отсутствует
    if (!raffleData.carSpecifications) {
      updates.carSpecifications = null;
    }
    
    // Проверка и обновление статуса, если он не соответствует допустимым значениям
    if (raffleData.status && !['active', 'completed', 'canceled', 'draft'].includes(raffleData.status)) {
      updates.status = 'draft';
    }
    
    // Применяем обновления, если они есть
    if (Object.keys(updates).length > 0) {
      const raffleRef = doc(db, 'raffles', raffleId);
      await updateDoc(raffleRef, updates);
      console.log(`Updated raffle: ${raffleId}`);
    }
  });
  
  await Promise.all(updatePromises);
  console.log('Raffles schema updated successfully!');
};

/**
 * Обновление структуры данных компаний
 */
const updateCompaniesSchema = async () => {
  console.log('Updating companies schema...');
  
  const companiesCollection = collection(db, 'companies');
  const snapshot = await getDocs(companiesCollection);
  
  const updatePromises = snapshot.docs.map(async (docSnapshot) => {
    const companyData = docSnapshot.data() as Company;
    const companyId = docSnapshot.id;
    const updates: Record<string, any> = {};
    
    // Проверяем и добавляем новые поля, если они отсутствуют
    if (companyData.color === undefined) {
      updates.color = '#0066cc'; // Дефолтный синий цвет
    }
    
    if (companyData.isMain === undefined) {
      updates.isMain = false;
    }
    
    if (companyData.description === undefined) {
      updates.description = '';
    }
    
    if (companyData.website === undefined) {
      updates.website = '';
    }
    
    if (companyData.phone === undefined) {
      updates.phone = '';
    }
    
    if (companyData.email === undefined) {
      updates.email = '';
    }
    
    if (companyData.address === undefined) {
      updates.address = '';
    }
    
    // Применяем обновления, если они есть
    if (Object.keys(updates).length > 0) {
      const companyRef = doc(db, 'companies', companyId);
      await updateDoc(companyRef, updates);
      console.log(`Updated company: ${companyId}`);
    }
  });
  
  await Promise.all(updatePromises);
  console.log('Companies schema updated successfully!');
};

/**
 * Создание коллекции car_features, если она не существует, и добавление базовых функций
 */
const ensureCarFeaturesCollection = async () => {
  console.log('Setting up car features collection...');
  
  // Проверка существования коллекции
  const featuresCollection = collection(db, 'carFeatures');
  const snapshot = await getDocs(featuresCollection);
  
  // Если коллекция пуста, добавляем базовые значения
  if (snapshot.empty) {
    console.log('Car features collection is empty. Adding default features...');
    
    const defaultFeatures: Omit<CarFeature, 'id'>[] = [
      { name: 'Кожаный салон', category: 'interior' },
      { name: 'Подогрев сидений', category: 'interior' },
      { name: 'Вентиляция сидений', category: 'interior' },
      { name: 'Панорамная крыша', category: 'interior' },
      { name: 'Премиум аудиосистема', category: 'interior' },
      { name: 'Климат-контроль', category: 'interior' },
      { name: 'Адаптивный круиз-контроль', category: 'safety' },
      { name: 'Система предотвращения столкновений', category: 'safety' },
      { name: 'Система мониторинга слепых зон', category: 'safety' },
      { name: 'Камеры кругового обзора', category: 'safety' },
      { name: 'Литые диски', category: 'exterior' },
      { name: 'LED фары', category: 'exterior' },
      { name: 'Спортивная выхлопная система', category: 'performance' },
      { name: 'Спортивная подвеска', category: 'performance' },
      { name: 'Навигационная система', category: 'technology' },
      { name: 'Беспроводная зарядка', category: 'technology' },
      { name: 'Apple CarPlay / Android Auto', category: 'technology' }
    ];
    
    const addPromises = defaultFeatures.map(async (feature, index) => {
      const featureId = `feature_${index + 1}`;
      const featureRef = doc(db, 'carFeatures', featureId);
      
      await setDoc(featureRef, {
        ...feature,
        id: featureId
      });
      
      console.log(`Added feature: ${feature.name}`);
    });
    
    await Promise.all(addPromises);
    console.log('Default car features added successfully!');
  } else {
    console.log('Car features collection already exists.');
  }
}; 