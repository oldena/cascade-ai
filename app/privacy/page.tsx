export const metadata = { title: 'Politique de confidentialité — Cascade AI' }

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-white">
      <h1 className="text-3xl font-bold mb-2">Politique de confidentialité</h1>
      <p className="text-cascade-muted text-sm mb-10">Dernière mise à jour : juin 2026</p>

      <section className="space-y-8 text-cascade-muted leading-relaxed">
        <div>
          <h2 className="text-white font-semibold text-lg mb-2">1. Qui sommes-nous ?</h2>
          <p>Cascade AI est un outil de création de contenu assisté par intelligence artificielle, édité par Ammadigitlamarketing. Contact : oaidara533@yahoo.it</p>
        </div>

        <div>
          <h2 className="text-white font-semibold text-lg mb-2">2. Données collectées</h2>
          <p>Nous collectons les données suivantes :</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Adresse e-mail et informations de profil lors de l'inscription (via Clerk)</li>
            <li>Contenu généré par les pipelines IA</li>
            <li>Tokens d'accès aux réseaux sociaux connectés (chiffrés)</li>
            <li>Données d'utilisation et de facturation</li>
          </ul>
        </div>

        <div>
          <h2 className="text-white font-semibold text-lg mb-2">3. Utilisation des données</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Fournir et améliorer le service Cascade AI</li>
            <li>Publier du contenu sur vos réseaux sociaux connectés à votre demande</li>
            <li>Gérer votre abonnement et votre facturation</li>
            <li>Vous envoyer des notifications liées au service</li>
          </ul>
        </div>

        <div>
          <h2 className="text-white font-semibold text-lg mb-2">4. Partage des données</h2>
          <p>Nous ne vendons jamais vos données. Nous partageons uniquement les données nécessaires avec :</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Clerk (authentification)</li>
            <li>Supabase (stockage sécurisé)</li>
            <li>Stripe / Revolut (paiement)</li>
            <li>Anthropic Claude API (génération de contenu)</li>
            <li>Meta / LinkedIn / TikTok / Twitter APIs (publication à votre demande)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-white font-semibold text-lg mb-2">5. Connexions aux réseaux sociaux</h2>
          <p>Lorsque vous connectez un réseau social (Facebook, Instagram, LinkedIn, etc.), nous stockons un token d'accès chiffré. Ce token est utilisé uniquement pour publier du contenu à votre demande explicite. Vous pouvez déconnecter votre compte à tout moment depuis les paramètres.</p>
        </div>

        <div>
          <h2 className="text-white font-semibold text-lg mb-2">6. Suppression des données</h2>
          <p>Pour supprimer votre compte et toutes vos données, envoyez un e-mail à oaidara533@yahoo.it avec l'objet "Suppression de compte". Vos données seront supprimées sous 30 jours.</p>
        </div>

        <div>
          <h2 className="text-white font-semibold text-lg mb-2">7. Cookies</h2>
          <p>Cascade AI utilise des cookies de session pour l'authentification. Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
        </div>

        <div>
          <h2 className="text-white font-semibold text-lg mb-2">8. Vos droits (RGPD)</h2>
          <p>Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à oaidara533@yahoo.it.</p>
        </div>
      </section>
    </main>
  )
}
