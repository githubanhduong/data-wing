// export { default as jaLogo } from '@/assets/images/airlines/JA.svg';
import ja from '@/assets/images/airlines/logos/JA.svg'
import nonLogo from '@/assets/images/airlines/logos/nonLogo.png'
import nonLogoSvg from '@/assets/images/airlines/logos/nonLogo.svg'

const airlineLogos : Record<string, string> = {}
airlineLogos['JA'] = ja;
airlineLogos['WJ'] = ja;

airlineLogos['nonLogo'] = nonLogo;
airlineLogos['nonLogoSvg'] = nonLogoSvg;


export default airlineLogos