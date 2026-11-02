import { Service } from '@angular/core';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';

/**
 * Writes every URL the router makes with a trailing slash, as the pages are
 * served: each one is a folder's index.html, and without the slash Cloudflare
 * answers with a redirect to it. The canonical links and the sitemap have it too.
 */
@Service()
export class TrailingSlashSerializer extends DefaultUrlSerializer {
  override parse(url: string): UrlTree {
    // The router matches paths without it, as Location hands them over.
    return super.parse(url.replace(/(.)\/+(?=[?#]|$)/, '$1'));
  }

  override serialize(tree: UrlTree): string {
    const url = super.serialize(tree);
    const [, path, rest] = url.match(/^([^?#]*)(.*)$/s)!;
    return path.endsWith('/') ? url : `${path}/${rest}`;
  }
}
