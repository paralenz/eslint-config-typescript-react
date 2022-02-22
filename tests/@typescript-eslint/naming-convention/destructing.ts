/* eslint-disable @typescript-eslint/naming-convention */
type ImportedType = {
  uses_snake_case: string
  AndPascalCase: string
}
/* eslint-enable @typescript-eslint/naming-convention */

export function foo({
  uses_snake_case,
  AndPascalCase
}: ImportedType) {
  console.log(uses_snake_case, AndPascalCase)
}

export function bar(type: ImportedType) {
  const { uses_snake_case, AndPascalCase } = type
  console.log(uses_snake_case, AndPascalCase)
}
