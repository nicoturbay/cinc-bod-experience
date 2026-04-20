import { createContext, useContext, useState } from 'react'

const ModeContext = createContext()

export function ModeProvider({ children }) {
  const [isBoard,           setIsBoard]           = useState(false)
  const [chatOpen,          setChatOpen]          = useState(false)
  const [activeTask,        setActiveTask]        = useState(null)
  const [cephAIPulseCount,  setCephAIPulseCount]  = useState(0)
  const [broadcastDraft,    setBroadcastDraft]    = useState(null)
  const [cephAICardContext, setCephAICardContext] = useState(null)

  return (
    <ModeContext.Provider value={{
      isBoard,           setIsBoard,
      chatOpen,          setChatOpen,
      activeTask,        setActiveTask,
      cephAIPulseCount,  setCephAIPulseCount,
      broadcastDraft,    setBroadcastDraft,
      cephAICardContext, setCephAICardContext,
    }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  return useContext(ModeContext)
}
