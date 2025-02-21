declare module "stockfish" {
    interface Stockfish {
      postMessage(message: string): void;
      onmessage: (event: string) => void;
    }
  
    function stockfish(): Stockfish;
  
    export default stockfish;
  }