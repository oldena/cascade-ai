export const metadata = { title: 'Suppression des données — Cascade AI' }

export default function DeleteDataPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 text-white">
      <h1 className="text-3xl font-bold mb-2">Suppression de vos données</h1>
      <p className="text-cascade-muted text-sm mb-10">Conformément au RGPD et aux politiques Meta</p>

      <section className="space-y-8 text-cascade-muted leading-relaxed">
        <div className="bg-cascade-card border border-cascade-border rounded-xl p-6">
          <h2 className="text-white font-semibold text-lg mb-3">Comment supprimer vos données ?</h2>
          <p className="mb-4">Vous pouvez supprimer toutes vos données personnelles de deux façons :</p>

          <div className="space-y-4">
            <div className="border border-cascade-border rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Option 1 — Depuis votre compte</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Connectez-vous à <a href="https://cascade-ai.netlify.app" className="text-cascade-red hover:underline">cascade-ai.netlify.app</a></li>
                <li>Allez dans Paramètres → Compte</li>
                <li>Cliquez sur "Supprimer mon compte"</li>
                <li>Confirmez la suppression</li>
              </ol>
              <p className="text-xs mt-2">Toutes vos données sont supprimées immédiatement.</p>
            </div>

            <div className="border border-cascade-border rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Option 2 — Par e-mail</h3>
              <p className="text-sm mb-2">Envoyez un e-mail à :</p>
              <a href="mailto:oaidara533@yahoo.it?subject=Suppression%20de%20compte%20Cascade%20AI"
                className="text-cascade-red hover:underline font-mono text-sm">
                oaidara533@yahoo.it
              </a>
              <p className="text-xs mt-2">Objet : "Suppression de compte Cascade AI"<br />
              Incluez l'adresse e-mail associée à votre compte.<br />
              Délai de traitement : 30 jours maximum.</p>
            </div>
          </div>
        </div>

        <div className="bg-cascade-card border border-cascade-border rounded-xl p-6">
          <h2 className="text-white font-semibold text-lg mb-3">Données supprimées</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Profil et informations de compte</li>
            <li>Tout le contenu généré par les pipelines</li>
            <li>Tokens d'accès aux réseaux sociaux connectés</li>
            <li>Historique des publications</li>
            <li>Données de facturation (hors obligations légales)</li>
          </ul>
        </div>

        <div className="bg-cascade-card border border-cascade-border rounded-xl p-6">
          <h2 className="text-white font-semibold text-lg mb-3">Données Facebook / Instagram</h2>
          <p className="text-sm">Si vous avez connecté Facebook ou Instagram à Cascade AI, la déconnexion ou suppression de votre compte révoque immédiatement notre accès à vos données Meta. Aucune donnée Facebook/Instagram n'est conservée après la suppression.</p>
        </div>

        <p className="text-xs text-cascade-muted">
          Pour toute question : <a href="mailto:oaidara533@yahoo.it" className="hover:text-white">oaidara533@yahoo.it</a>
        </p>
      </section>
    </main>
  )
}
