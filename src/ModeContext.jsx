import { createContext, useContext, useState } from 'react'

const ModeContext = createContext()

export function ModeProvider({ children }) {
  const [isBoard, setIsBoard] = useState(false) // default: Resident Experience
  return (
    <ModeContext.Provider value={{ isBoard, setIsBoard }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  return useContext(ModeContext)
}
