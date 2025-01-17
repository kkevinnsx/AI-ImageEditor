import React from "react"
import { StoreApi } from "zustand"

export const createZustandContext = <TInicial, TStore extends StoreApi<any>>(
    getStore: (initial: TInicial ) => TStore ) => {
        const Context = React.createContext(null as any as TStore)

        const Provider = (props: {
            children?: React.ReactNode
            initialValue: TInicial
        }) => {
            const [store] = React.useState(getStore(props.initialValue))

            return <Context.Provider value={store}>{props.children}</Context.Provider>
        }

        return {
            useContext: () => React.useContext(Context),
            Context,
            Provider,
        }
    }

