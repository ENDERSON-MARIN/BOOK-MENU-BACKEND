const isDev = process.env.NODE_ENV !== "production"

export const devLog = (...args: unknown[]): void => {
  if (isDev) {
    console.log(...args)
  }
}

export const devError = (...args: unknown[]): void => {
  if (isDev) {
    console.error(...args)
  }
}
