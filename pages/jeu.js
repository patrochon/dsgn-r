import * as MENUS from 'constants/menus';

import { gql, useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import {
  Header,
  Footer,
  Main,
  NavigationMenu,
  SEO,
} from 'components';
import { BlogInfoFragment } from 'fragments/GeneralSettings';
import styles from 'styles/pages/_Jeu.module.scss';

export default function Page() {
  const { data } = useQuery(Page.query, {
    variables: Page.variables(),
  });

  if (!data) return null;

  const { title: siteTitle, description: siteDescription } =
    data.generalSettings;
  const primaryMenu = data.headerMenuItems?.nodes ?? [];
  const footerMenu = data.footerMenuItems?.nodes ?? [];

  return (
    <>
      <SEO
        title={`Détopia — Carte RPG | ${siteTitle}`}
        description="Un jeu de plateau RPG en cartes — déplacement sur grille, combats, sorts et trésors."
      />

      <Header
        title={siteTitle}
        description={siteDescription}
        menuItems={primaryMenu}
      />

      <Main className={styles.jeuMain}>
        <div className={styles.gameWrapper}>
          <iframe
            src="/game/index.html"
            title="Détopia — Carte RPG"
            className={styles.gameFrame}
            allowFullScreen
          />
        </div>
      </Main>

      <Footer title={siteTitle} menuItems={footerMenu} />
    </>
  );
}

Page.variables = () => ({
  headerLocation: MENUS.PRIMARY_LOCATION,
  footerLocation: MENUS.FOOTER_LOCATION,
});

Page.query = gql`
  ${BlogInfoFragment}
  ${NavigationMenu.fragments.entry}
  query GetJeuPageData(
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
  ) {
    generalSettings {
      ...BlogInfoFragment
    }
    headerMenuItems: menuItems(where: { location: $headerLocation }) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }
    footerMenuItems: menuItems(where: { location: $footerLocation }) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }
  }
`;

export function getStaticProps(ctx) {
  return getNextStaticProps(ctx, { Page });
}
