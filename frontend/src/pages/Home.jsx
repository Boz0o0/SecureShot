export default function Home() {
  return (
    <div>
      <h1>SecureShot</h1>
      <p>Entrez votre code de session pour accéder à vos photos</p>
      <input type="text" placeholder="Code de session (6 caractères)" />
      <button>Accéder à la session</button>
    </div>
  );
}