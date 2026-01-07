// Главный файл приложения
import { App } from './core/app.js';
import { resolvePath } from './core/paths.js';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(resolvePath('service-worker.js'))
            .then(registration => {
                console.log('Service Worker зарегистрирован:', registration);
                
                // Проверка обновлений
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Показать уведомление об обновлении
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Ошибка регистрации Service Worker:', error);
            });
    });
}

// Показать уведомление об обновлении
function showUpdateNotification() {
    const notification = document.querySelector('.update-notification');
    if (notification) {
        notification.hidden = false;
        
        notification.querySelector('[data-update-reload]').addEventListener('click', () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
                    setTimeout(() => window.location.reload(), 100);
                });
            } else {
                window.location.reload();
            }
        });
        
        // Автоматическое скрытие через 30 секунд
        setTimeout(() => {
            notification.hidden = true;
        }, 30000);
    }
}

// Обнаружение офлайн-режима
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    const indicator = document.querySelector('.offline-indicator');
    if (indicator) {
        indicator.classList.toggle('offline-indicator--visible', !navigator.onLine);
    }
}

// Обновление статуса при загрузке
updateOnlineStatus();
