import React, { FC } from 'react'

export default () => {
  function myFn () { return true }
  myFn()

  const myConst = () => { return true }
  myConst()

  return (
    <Title
      color='red'
      sizeInPx={42}
      text='Hello world'
    />
  )
}

const Title: FC<{
  color: string;
  sizeInPx: number;
  text: string
}> = ({ children, color, sizeInPx }) => {
  return (
    <h1 style={{ color, fontSize: `${sizeInPx}px` }}>{children}</h1>
  )
}
