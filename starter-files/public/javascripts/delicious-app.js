import '../sass/style.scss';

import autoComplete from './modules/autoComplete';
import { $, $$ } from './modules/bling';

autoComplete($('#address'), $('#lat'), $('#lng'));
