import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, initializeAuth, inMemoryPersistence, type Auth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: 'AIzaSyA7Vv_o470vFcSM-JEG78ypUBAIyn1yYEs',
    authDomain: 'undefined-studio-dashboard.firebaseapp.com',
    projectId: 'undefined-studio-dashboard',
    storageBucket: 'undefined-studio-dashboard.firebasestorage.app',
    messagingSenderId: '198328145222',
    appId: '1:198328145222:web:bcd91d70e2150c44f20147',
    measurementId: 'G-DYLD2NHSNR',
}

export const ADMIN_UIDS = new Set(['kVurSY6zZMYaDI2xZJ3a4JydJFG2'])

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

let analyticsStarted = false
void (async () => {
    if (analyticsStarted || typeof window === 'undefined') return
    if (await isSupported()) {
        getAnalytics(app)
        analyticsStarted = true
    }
})()

let secondaryAuth: Auth | null = null

export function getSecondaryAdminAuth() {
    if (secondaryAuth) return secondaryAuth

    const secondaryApp =
        getApps().find((item) => item.name === 'admin-account-creator') ??
        initializeApp(firebaseConfig, 'admin-account-creator')

    try {
        secondaryAuth = initializeAuth(secondaryApp, {
            persistence: inMemoryPersistence,
        })
    } catch {
        secondaryAuth = getAuth(secondaryApp)
    }

    return secondaryAuth
}

export function isBootstrapAdmin(uid: string) {
    return ADMIN_UIDS.has(uid)
}
