// Accesso al localStorage che non fallisce: in navigazione privata o con i dati bloccati restituisce null o false.
export function readStored(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeStored(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
