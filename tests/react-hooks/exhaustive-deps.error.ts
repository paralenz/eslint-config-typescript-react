import { useEffect } from "react"

export const useMyHook = (state: any) => {
    useEffect(()=>{
        console.log(state)
    }, [])
}