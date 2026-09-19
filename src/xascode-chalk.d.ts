declare module '@xascode/chalk' {
  type Chalk = {
    blue: (text: string) => string;
  };

  const chalk: Chalk;

  export default chalk;
}