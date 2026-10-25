import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DOCS, ISSUES_URL, RELEASES_URL, REPO_URL } from '../site';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { class: 'block border-t border-stroke bg-bg-alt' },
  templateUrl: './footer.html',
})
export class Footer {
  protected readonly docs = DOCS;
  protected readonly repoUrl = REPO_URL;
  protected readonly releasesUrl = RELEASES_URL;
  protected readonly issuesUrl = ISSUES_URL;
  protected readonly year = new Date().getFullYear();
}
