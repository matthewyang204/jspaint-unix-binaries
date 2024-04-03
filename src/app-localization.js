// @ts-check

// Circular dependency: msgbox.js uses localize for its default title.
// Leaving as a global for now.
// import { showMessageBox } from "./msgbox.js";

// Messy conversion to ESM for now. Avoiding indentation changes to make the diff easier to read.
const exports = {};

/** @type {Promise} */
let data_loaded;

(() => {
	// @TODO: DRY hotkey helpers
	// & defines accelerators (hotkeys) in menus and buttons and things, which get underlined in the UI.
	// & can be escaped by doubling it, e.g. "&Taskbar && Start Menu"
	function index_of_hotkey(text) {
		// Returns the index of the ampersand that defines a hotkey, or -1 if not present.

		// return english_text.search(/(?<!&)&(?!&|\s)/); // not enough browser support for negative lookbehind assertions

		// The space here handles beginning-of-string matching and counteracts the offset for the [^&] so it acts like a negative lookbehind
		return ` ${text}`.search(/[^&]&[^&\s]/);
	}
	function has_hotkey(text) {
		return index_of_hotkey(text) !== -1;
	}
	function remove_hotkey(text) {
		return text.replace(/\s?\(&.\)/, "").replace(/([^&]|^)&([^&\s])/, "$1$2");
	}
	function display_hotkey(text) {
		// misnomer: using .menu-hotkey out of laziness, instead of a more general term like .hotkey or .accelerator
		return `<span style="white-space: pre">${text.replace(/([^&]|^)&([^&\s])/, "$1<span class='menu-hotkey'>$2</span>").replace(/&&/g, "&")}</span>`;
	}
	function get_hotkey(text) {
		return text[index_of_hotkey(text) + 1].toUpperCase();
	}

	let localizations = {};
	/**
	 * @param {string} english_text - The English text to localize
	 * @param  {...string} interpolations - Strings to replace %1, %2, etc.
	 * @returns {string} - Text in the current language
	 */
	function localize(english_text, ...interpolations) {
		function find_localization(english_text) {
			const amp_index = index_of_hotkey(english_text);
			if (amp_index > -1) {
				const without_hotkey = remove_hotkey(english_text);
				if (localizations[without_hotkey]) {
					const hotkey_def = english_text.slice(amp_index, amp_index + 2);
					if (localizations[without_hotkey].toUpperCase().indexOf(hotkey_def.toUpperCase()) > -1) {
						return localizations[without_hotkey];
					} else {
						if (has_hotkey(localizations[without_hotkey])) {
							// window.console && console.warn(`Localization has differing accelerator (hotkey) hint: '${localizations[without_hotkey]}' vs '${english_text}'`);
							// @TODO: detect differing accelerator more generally
							return `${remove_hotkey(localizations[without_hotkey])} (${hotkey_def})`;
						}
						return `${localizations[without_hotkey]} (${hotkey_def})`;
					}
				}
			}
			if (localizations[english_text]) {
				return localizations[english_text];
			}
			return english_text;
		}
		function interpolate(text, interpolations) {
			for (let i = 0; i < interpolations.length; i++) {
				text = text.replace(`%${i + 1}`, interpolations[i]);
			}
			return text;
		}
		return interpolate(find_localization(english_text), interpolations);
	}

	const language_storage_key = "jspaint language";
	const accepted_languages = Array.from(navigator.languages || [navigator.language || navigator.userLanguage]);
	try {
		if (localStorage[language_storage_key]) {
			accepted_languages.unshift(localStorage[language_storage_key]);
		}
	} catch (error) {
		// if there's no localStorage access, you can still configure the language via system settings, theoretically
		// TODO: also via URL?
	}

	var language_to_default_region = {
		aa: 'ET',
		ab: 'GE',
		abr: 'GH',
		ace: 'ID',
		ach: 'UG',
		ada: 'GH',
		ady: 'RU',
		ae: 'IR',
		aeb: 'TN',
		af: 'ZA',
		agq: 'CM',
		aho: 'IN',
		ak: 'GH',
		akk: 'IQ',
		aln: 'XK',
		alt: 'RU',
		am: 'ET',
		amo: 'NG',
		aoz: 'ID',
		apd: 'TG',
		ar: 'EG',
		arc: 'IR',
		'arc-Nbat': 'JO',
		'arc-Palm': 'SY',
		arn: 'CL',
		aro: 'BO',
		arq: 'DZ',
		ary: 'MA',
		arz: 'EG',
		as: 'IN',
		asa: 'TZ',
		ase: 'US',
		ast: 'ES',
		atj: 'CA',
		av: 'RU',
		awa: 'IN',
		ay: 'BO',
		az: 'AZ',
		'az-Arab': 'IR',
		ba: 'RU',
		bal: 'PK',
		ban: 'ID',
		bap: 'NP',
		bar: 'AT',
		bas: 'CM',
		bax: 'CM',
		bbc: 'ID',
		bbj: 'CM',
		bci: 'CI',
		be: 'BY',
		bej: 'SD',
		bem: 'ZM',
		bew: 'ID',
		bez: 'TZ',
		bfd: 'CM',
		bfq: 'IN',
		bft: 'PK',
		bfy: 'IN',
		bg: 'BG',
		bgc: 'IN',
		bgn: 'PK',
		bgx: 'TR',
		bhb: 'IN',
		bhi: 'IN',
		bhk: 'PH',
		bho: 'IN',
		bi: 'VU',
		bik: 'PH',
		bin: 'NG',
		bjj: 'IN',
		bjn: 'ID',
		bjt: 'SN',
		bkm: 'CM',
		bku: 'PH',
		blt: 'VN',
		bm: 'ML',
		bmq: 'ML',
		bn: 'BD',
		bo: 'CN',
		bpy: 'IN',
		bqi: 'IR',
		bqv: 'CI',
		br: 'FR',
		bra: 'IN',
		brh: 'PK',
		brx: 'IN',
		bs: 'BA',
		bsq: 'LR',
		bss: 'CM',
		bto: 'PH',
		btv: 'PK',
		bua: 'RU',
		buc: 'YT',
		bug: 'ID',
		bum: 'CM',
		bvb: 'GQ',
		byn: 'ER',
		byv: 'CM',
		bze: 'ML',
		ca: 'ES',
		cch: 'NG',
		ccp: 'BD',
		ce: 'RU',
		ceb: 'PH',
		cgg: 'UG',
		ch: 'GU',
		chk: 'FM',
		chm: 'RU',
		cho: 'US',
		chp: 'CA',
		chr: 'US',
		cja: 'KH',
		cjm: 'VN',
		ckb: 'IQ',
		co: 'FR',
		cop: 'EG',
		cps: 'PH',
		cr: 'CA',
		crh: 'UA',
		crj: 'CA',
		crk: 'CA',
		crl: 'CA',
		crm: 'CA',
		crs: 'SC',
		cs: 'CZ',
		csb: 'PL',
		csw: 'CA',
		ctd: 'MM',
		cu: 'RU',
		'cu-Glag': 'BG',
		cv: 'RU',
		cy: 'GB',
		da: 'DK',
		dak: 'US',
		dar: 'RU',
		dav: 'KE',
		dcc: 'IN',
		de: 'DE',
		den: 'CA',
		dgr: 'CA',
		dje: 'NE',
		dnj: 'CI',
		doi: 'IN',
		dsb: 'DE',
		dtm: 'ML',
		dtp: 'MY',
		dty: 'NP',
		dua: 'CM',
		dv: 'MV',
		dyo: 'SN',
		dyu: 'BF',
		dz: 'BT',
		ebu: 'KE',
		ee: 'GH',
		efi: 'NG',
		egl: 'IT',
		egy: 'EG',
		eky: 'MM',
		el: 'GR',
		en: 'US',
		'en-Shaw': 'GB',
		es: 'ES',
		esu: 'US',
		et: 'EE',
		ett: 'IT',
		eu: 'ES',
		ewo: 'CM',
		ext: 'ES',
		fa: 'IR',
		fan: 'GQ',
		ff: 'SN',
		'ff-Adlm': 'GN',
		ffm: 'ML',
		fi: 'FI',
		fia: 'SD',
		fil: 'PH',
		fit: 'SE',
		fj: 'FJ',
		fo: 'FO',
		fon: 'BJ',
		fr: 'FR',
		frc: 'US',
		frp: 'FR',
		frr: 'DE',
		frs: 'DE',
		fub: 'CM',
		fud: 'WF',
		fuf: 'GN',
		fuq: 'NE',
		fur: 'IT',
		fuv: 'NG',
		fvr: 'SD',
		fy: 'NL',
		ga: 'IE',
		gaa: 'GH',
		gag: 'MD',
		gan: 'CN',
		gay: 'ID',
		gbm: 'IN',
		gbz: 'IR',
		gcr: 'GF',
		gd: 'GB',
		gez: 'ET',
		ggn: 'NP',
		gil: 'KI',
		gjk: 'PK',
		gju: 'PK',
		gl: 'ES',
		glk: 'IR',
		gn: 'PY',
		gom: 'IN',
		gon: 'IN',
		gor: 'ID',
		gos: 'NL',
		got: 'UA',
		grc: 'CY',
		'grc-Linb': 'GR',
		grt: 'IN',
		gsw: 'CH',
		gu: 'IN',
		gub: 'BR',
		guc: 'CO',
		gur: 'GH',
		guz: 'KE',
		gv: 'IM',
		gvr: 'NP',
		gwi: 'CA',
		ha: 'NG',
		hak: 'CN',
		haw: 'US',
		haz: 'AF',
		he: 'IL',
		hi: 'IN',
		hif: 'FJ',
		hil: 'PH',
		hlu: 'TR',
		hmd: 'CN',
		hnd: 'PK',
		hne: 'IN',
		hnj: 'LA',
		hnn: 'PH',
		hno: 'PK',
		ho: 'PG',
		hoc: 'IN',
		hoj: 'IN',
		hr: 'HR',
		hsb: 'DE',
		hsn: 'CN',
		ht: 'HT',
		hu: 'HU',
		hy: 'AM',
		hz: 'NA',
		ia: 'FR',
		iba: 'MY',
		ibb: 'NG',
		id: 'ID',
		ife: 'TG',
		ig: 'NG',
		ii: 'CN',
		ik: 'US',
		ikt: 'CA',
		ilo: 'PH',
		in: 'ID',
		inh: 'RU',
		is: 'IS',
		it: 'IT',
		iu: 'CA',
		iw: 'IL',
		izh: 'RU',
		ja: 'JP',
		jam: 'JM',
		jgo: 'CM',
		ji: 'UA',
		jmc: 'TZ',
		jml: 'NP',
		jut: 'DK',
		jv: 'ID',
		jw: 'ID',
		ka: 'GE',
		kaa: 'UZ',
		kab: 'DZ',
		kac: 'MM',
		kaj: 'NG',
		kam: 'KE',
		kao: 'ML',
		kbd: 'RU',
		kby: 'NE',
		kcg: 'NG',
		kck: 'ZW',
		kde: 'TZ',
		kdh: 'TG',
		kdt: 'TH',
		kea: 'CV',
		ken: 'CM',
		kfo: 'CI',
		kfr: 'IN',
		kfy: 'IN',
		kg: 'CD',
		kge: 'ID',
		kgp: 'BR',
		kha: 'IN',
		khb: 'CN',
		khn: 'IN',
		khq: 'ML',
		kht: 'IN',
		khw: 'PK',
		ki: 'KE',
		kiu: 'TR',
		kj: 'NA',
		kjg: 'LA',
		kk: 'KZ',
		'kk-Arab': 'CN',
		kkj: 'CM',
		kl: 'GL',
		kln: 'KE',
		km: 'KH',
		kmb: 'AO',
		kn: 'IN',
		knf: 'SN',
		ko: 'KR',
		koi: 'RU',
		kok: 'IN',
		kos: 'FM',
		kpe: 'LR',
		krc: 'RU',
		kri: 'SL',
		krj: 'PH',
		krl: 'RU',
		kru: 'IN',
		ks: 'IN',
		ksb: 'TZ',
		ksf: 'CM',
		ksh: 'DE',
		ku: 'TR',
		'ku-Arab': 'IQ',
		kum: 'RU',
		kv: 'RU',
		kvr: 'ID',
		kvx: 'PK',
		kw: 'GB',
		kxm: 'TH',
		kxp: 'PK',
		ky: 'KG',
		'ky-Arab': 'CN',
		'ky-Latn': 'TR',
		la: 'VA',
		lab: 'GR',
		lad: 'IL',
		lag: 'TZ',
		lah: 'PK',
		laj: 'UG',
		lb: 'LU',
		lbe: 'RU',
		lbw: 'ID',
		lcp: 'CN',
		lep: 'IN',
		lez: 'RU',
		lg: 'UG',
		li: 'NL',
		lif: 'NP',
		'lif-Limb': 'IN',
		lij: 'IT',
		lis: 'CN',
		ljp: 'ID',
		lki: 'IR',
		lkt: 'US',
		lmn: 'IN',
		lmo: 'IT',
		ln: 'CD',
		lo: 'LA',
		lol: 'CD',
		loz: 'ZM',
		lrc: 'IR',
		lt: 'LT',
		ltg: 'LV',
		lu: 'CD',
		lua: 'CD',
		luo: 'KE',
		luy: 'KE',
		luz: 'IR',
		lv: 'LV',
		lwl: 'TH',
		lzh: 'CN',
		lzz: 'TR',
		mad: 'ID',
		maf: 'CM',
		mag: 'IN',
		mai: 'IN',
		mak: 'ID',
		man: 'GM',
		'man-Nkoo': 'GN',
		mas: 'KE',
		maz: 'MX',
		mdf: 'RU',
		mdh: 'PH',
		mdr: 'ID',
		men: 'SL',
		mer: 'KE',
		mfa: 'TH',
		mfe: 'MU',
		mg: 'MG',
		mgh: 'MZ',
		mgo: 'CM',
		mgp: 'NP',
		mgy: 'TZ',
		mh: 'MH',
		mi: 'NZ',
		min: 'ID',
		mis: 'IQ',
		mk: 'MK',
		ml: 'IN',
		mls: 'SD',
		mn: 'MN',
		'mn-Mong': 'CN',
		mni: 'IN',
		mnw: 'MM',
		moe: 'CA',
		moh: 'CA',
		mos: 'BF',
		mr: 'IN',
		mrd: 'NP',
		mrj: 'RU',
		mro: 'BD',
		ms: 'MY',
		mt: 'MT',
		mtr: 'IN',
		mua: 'CM',
		mus: 'US',
		mvy: 'PK',
		mwk: 'ML',
		mwr: 'IN',
		mwv: 'ID',
		mxc: 'ZW',
		my: 'MM',
		myv: 'RU',
		myx: 'UG',
		myz: 'IR',
		mzn: 'IR',
		na: 'NR',
		nan: 'CN',
		nap: 'IT',
		naq: 'NA',
		nb: 'NO',
		nch: 'MX',
		nd: 'ZW',
		ndc: 'MZ',
		nds: 'DE',
		ne: 'NP',
		new: 'NP',
		ng: 'NA',
		ngl: 'MZ',
		nhe: 'MX',
		nhw: 'MX',
		nij: 'ID',
		niu: 'NU',
		njo: 'IN',
		nl: 'NL',
		nmg: 'CM',
		nn: 'NO',
		nnh: 'CM',
		no: 'NO',
		nod: 'TH',
		noe: 'IN',
		non: 'SE',
		nqo: 'GN',
		nr: 'ZA',
		nsk: 'CA',
		nso: 'ZA',
		nus: 'SS',
		nv: 'US',
		nxq: 'CN',
		ny: 'MW',
		nym: 'TZ',
		nyn: 'UG',
		nzi: 'GH',
		oc: 'FR',
		om: 'ET',
		or: 'IN',
		os: 'GE',
		osa: 'US',
		otk: 'MN',
		pa: 'IN',
		'pa-Arab': 'PK',
		pag: 'PH',
		pal: 'IR',
		'pal-Phlp': 'CN',
		pam: 'PH',
		pap: 'AW',
		pau: 'PW',
		pcd: 'FR',
		pcm: 'NG',
		pdc: 'US',
		pdt: 'CA',
		peo: 'IR',
		pfl: 'DE',
		phn: 'LB',
		pka: 'IN',
		pko: 'KE',
		pl: 'PL',
		pms: 'IT',
		pnt: 'GR',
		pon: 'FM',
		pra: 'PK',
		prd: 'IR',
		ps: 'AF',
		pt: 'PT',//'BR',
		puu: 'GA',
		qu: 'PE',
		quc: 'GT',
		qug: 'EC',
		raj: 'IN',
		rcf: 'RE',
		rej: 'ID',
		rgn: 'IT',
		ria: 'IN',
		rif: 'MA',
		rjs: 'NP',
		rkt: 'BD',
		rm: 'CH',
		rmf: 'FI',
		rmo: 'CH',
		rmt: 'IR',
		rmu: 'SE',
		rn: 'BI',
		rng: 'MZ',
		ro: 'RO',
		rob: 'ID',
		rof: 'TZ',
		rtm: 'FJ',
		ru: 'RU',
		rue: 'UA',
		rug: 'SB',
		rw: 'RW',
		rwk: 'TZ',
		ryu: 'JP',
		sa: 'IN',
		saf: 'GH',
		sah: 'RU',
		saq: 'KE',
		sas: 'ID',
		sat: 'IN',
		sav: 'SN',
		saz: 'IN',
		sbp: 'TZ',
		sc: 'IT',
		sck: 'IN',
		scn: 'IT',
		sco: 'GB',
		scs: 'CA',
		sd: 'PK',
		'sd-Deva': 'IN',
		'sd-Khoj': 'IN',
		'sd-Sind': 'IN',
		sdc: 'IT',
		sdh: 'IR',
		se: 'NO',
		sef: 'CI',
		seh: 'MZ',
		sei: 'MX',
		ses: 'ML',
		sg: 'CF',
		sga: 'IE',
		sgs: 'LT',
		shi: 'MA',
		shn: 'MM',
		si: 'LK',
		sid: 'ET',
		sk: 'SK',
		skr: 'PK',
		sl: 'SI',
		sli: 'PL',
		sly: 'ID',
		sm: 'WS',
		sma: 'SE',
		smj: 'SE',
		smn: 'FI',
		smp: 'IL',
		sms: 'FI',
		sn: 'ZW',
		snk: 'ML',
		so: 'SO',
		sou: 'TH',
		sq: 'AL',
		sr: 'RS',
		srb: 'IN',
		srn: 'SR',
		srr: 'SN',
		srx: 'IN',
		ss: 'ZA',
		ssy: 'ER',
		st: 'ZA',
		stq: 'DE',
		su: 'ID',
		suk: 'TZ',
		sus: 'GN',
		sv: 'SE',
		sw: 'TZ',
		swb: 'YT',
		swc: 'CD',
		swg: 'DE',
		swv: 'IN',
		sxn: 'ID',
		syl: 'BD',
		syr: 'IQ',
		szl: 'PL',
		ta: 'IN',
		taj: 'NP',
		tbw: 'PH',
		tcy: 'IN',
		tdd: 'CN',
		tdg: 'NP',
		tdh: 'NP',
		te: 'IN',
		tem: 'SL',
		teo: 'UG',
		tet: 'TL',
		tg: 'TJ',
		'tg-Arab': 'PK',
		th: 'TH',
		thl: 'NP',
		thq: 'NP',
		thr: 'NP',
		ti: 'ET',
		tig: 'ER',
		tiv: 'NG',
		tk: 'TM',
		tkl: 'TK',
		tkr: 'AZ',
		tkt: 'NP',
		tl: 'PH',
		tly: 'AZ',
		tmh: 'NE',
		tn: 'ZA',
		to: 'TO',
		tog: 'MW',
		tpi: 'PG',
		tr: 'TR',
		tru: 'TR',
		trv: 'TW',
		ts: 'ZA',
		tsd: 'GR',
		tsf: 'NP',
		tsg: 'PH',
		tsj: 'BT',
		tt: 'RU',
		ttj: 'UG',
		tts: 'TH',
		ttt: 'AZ',
		tum: 'MW',
		tvl: 'TV',
		twq: 'NE',
		txg: 'CN',
		ty: 'PF',
		tyv: 'RU',
		tzm: 'MA',
		udm: 'RU',
		ug: 'CN',
		'ug-Cyrl': 'KZ',
		uga: 'SY',
		uk: 'UA',
		uli: 'FM',
		umb: 'AO',
		und: 'US',
		unr: 'IN',
		'unr-Deva': 'NP',
		unx: 'IN',
		ur: 'PK',
		uz: 'UZ',
		'uz-Arab': 'AF',
		vai: 'LR',
		ve: 'ZA',
		vec: 'IT',
		vep: 'RU',
		vi: 'VN',
		vic: 'SX',
		vls: 'BE',
		vmf: 'DE',
		vmw: 'MZ',
		vot: 'RU',
		vro: 'EE',
		vun: 'TZ',
		wa: 'BE',
		wae: 'CH',
		wal: 'ET',
		war: 'PH',
		wbp: 'AU',
		wbq: 'IN',
		wbr: 'IN',
		wls: 'WF',
		wni: 'KM',
		wo: 'SN',
		wtm: 'IN',
		wuu: 'CN',
		xav: 'BR',
		xcr: 'TR',
		xh: 'ZA',
		xlc: 'TR',
		xld: 'TR',
		xmf: 'GE',
		xmn: 'CN',
		xmr: 'SD',
		xna: 'SA',
		xnr: 'IN',
		xog: 'UG',
		xpr: 'IR',
		xsa: 'YE',
		xsr: 'NP',
		yao: 'MZ',
		yap: 'FM',
		yav: 'CM',
		ybb: 'CM',
		yo: 'NG',
		yrl: 'BR',
		yua: 'MX',
		yue: 'HK',
		'yue-Hans': 'CN',
		za: 'CN',
		zag: 'SD',
		zdj: 'KM',
		zea: 'NL',
		zgh: 'MA',
		zh: 'CN',
		'zh-Bopo': 'TW',
		'zh-Hanb': 'TW',
		'zh-Hant': 'TW',
		zlm: 'TG',
		zmi: 'MY',
		zu: 'ZA',
		zza: 'TR',
	};

	function get_language_emoji(locale) {
		var split = locale.toUpperCase().split(/-|_/);
		var lang = split.shift();
		var code = split.pop();

		if (!/^[A-Z]{2}$/.test(code)) {
			code = language_to_default_region[lang.toLowerCase()];
		}

		if (!code) {
			return '';
		}

		const a = String.fromCodePoint(code.codePointAt(0) - 0x41 + 0x1F1E6);
		const b = String.fromCodePoint(code.codePointAt(1) - 0x41 + 0x1F1E6);
		return a + b;
	}

	const base_language = "en";
	// This array can be updated automatically by preprocess.js, although that feature is likely no longer useful,
	// as I have added all the languages from Windows 98 editions that I could find, and additional languages
	// will not be through preprocessing resource files from Windows 98.
	// (preprocess.js may still be useful since the preprocessing wasn't perfect, and I could improve and re-run it,
	// but that won't add new languages.)
	const available_languages = ["ar", "cs", "da", "de", "el", "en", "es", "fi", "fr", "he", "hu", "it", "ja", "ko", "nl", "no", "pl", "pt", "pt-br", "ru", "sk", "sl", "sv", "tr", "zh", "zh-simplified"];
	// spell-checker:disable
	const language_names = {
		// "639-1": [["ISO language name"], ["Native name (endonym)"]],
		ab: [["Abkhazian"], ["Аҧсуа Бызшәа", "Аҧсшәа"]],
		aa: [["Afar"], ["Afaraf"]],
		af: [["Afrikaans"], ["Afrikaans"]],
		ak: [["Akan"], ["Akan"]],
		sq: [["Albanian"], ["Shqip"]],
		am: [["Amharic"], ["አማርኛ"]],
		ar: [["Arabic"], ["العربية"]],
		an: [["Aragonese"], ["Aragonés"]],
		hy: [["Armenian"], ["Հայերեն"]],
		as: [["Assamese"], ["অসমীয়া"]],
		av: [["Avaric"], ["Авар МацӀ", "МагӀарул МацӀ"]],
		ae: [["Avestan"], ["Avesta"]],
		ay: [["Aymara"], ["Aymar Aru"]],
		az: [["Azerbaijani"], ["Azərbaycan Dili"]],
		bm: [["Bambara"], ["Bamanankan"]],
		ba: [["Bashkir"], ["Башҡорт Теле"]],
		eu: [["Basque"], ["Euskara", "Euskera"]],
		be: [["Belarusian"], ["Беларуская Мова"]],
		bn: [["Bengali"], ["বাংলা"]],
		bh: [["Bihari Languages"], ["भोजपुरी"]],
		bi: [["Bislama"], ["Bislama"]],
		bs: [["Bosnian"], ["Bosanski Jezik"]],
		br: [["Breton"], ["Brezhoneg"]],
		bg: [["Bulgarian"], ["Български Език"]],
		my: [["Burmese"], ["ဗမာစာ"]],
		ca: [["Catalan", "Valencian"], ["Català", "Valencià"]],
		ch: [["Chamorro"], ["Chamoru"]],
		ce: [["Chechen"], ["Нохчийн Мотт"]],
		ny: [["Chichewa", "Chewa", "Nyanja"], ["ChiCheŵa", "Chinyanja"]],
		// zh: [["Chinese"], ["中文", "Zhōngwén", "汉语", "漢語"]],
		// The ISO 639-1 code "zh" doesn't refer to Traditional Chinese specifically,
		// but we want to show the distinction between Chinese varieties in the Language menu,
		// so this is overly specific for now.
		// @TODO: do this cleaner by establishing a mapping between ISO codes (such as "zh") and default language IDs (such as "zh-traditional")
		zh: [["Traditional Chinese"], ["繁體中文", "傳統中文", "正體中文", "繁体中文"]],
		"zh-traditional": [["Traditional Chinese"], ["繁體中文", "傳統中文", "正體中文", "繁体中文"]], // made-up ID, not real ISO 639-1
		"zh-simplified": [["Simple Chinese"], ["简体中文"]], // made-up ID, not real ISO 639-1
		cv: [["Chuvash"], ["Чӑваш Чӗлхи"]],
		kw: [["Cornish"], ["Kernewek"]],
		co: [["Corsican"], ["Corsu", "Lingua Corsa"]],
		cr: [["Cree"], ["ᓀᐦᐃᔭᐍᐏᐣ"]],
		hr: [["Croatian"], ["Hrvatski Jezik"]],
		cs: [["Czech"], ["Čeština", "Český Jazyk"]],
		da: [["Danish"], ["Dansk"]],
		dv: [["Divehi", "Dhivehi", "Maldivian"], ["ދިވެހި"]],
		nl: [["Dutch", "Flemish"], ["Nederlands", "Vlaams"]],
		dz: [["Dzongkha"], ["རྫོང་ཁ"]],
		en: [["English"], ["English"]],
		eo: [["Esperanto"], ["Esperanto"]],
		et: [["Estonian"], ["Eesti", "Eesti Keel"]],
		ee: [["Ewe"], ["Eʋegbe"]],
		fo: [["Faroese"], ["Føroyskt"]],
		fj: [["Fijian"], ["Vosa Vakaviti"]],
		fi: [["Finnish"], ["Suomi", "Suomen Kieli"]],
		fr: [["French"], ["Français", "Langue Française"]],
		ff: [["Fulah"], ["Fulfulde", "Pulaar", "Pular"]],
		gl: [["Galician"], ["Galego"]],
		ka: [["Georgian"], ["ქართული"]],
		de: [["German"], ["Deutsch"]],
		el: [["Greek"], ["Ελληνικά"]],
		gn: [["Guarani"], ["Avañe'ẽ"]],
		gu: [["Gujarati"], ["ગુજરાતી"]],
		ht: [["Haitian", "Haitian Creole"], ["Kreyòl Ayisyen"]],
		ha: [["Hausa"], ["هَوُسَ"]],
		he: [["Hebrew"], ["עברית"]],
		hz: [["Herero"], ["Otjiherero"]],
		hi: [["Hindi"], ["हिन्दी", "हिंदी"]],
		ho: [["Hiri Motu"], ["Hiri Motu"]],
		hu: [["Hungarian"], ["Magyar"]],
		ia: [["Interlingua"], ["Interlingua"]],
		id: [["Indonesian"], ["Bahasa Indonesia"]],
		ie: [["Interlingue", "Occidental"], ["Interlingue", "Occidental"]],
		ga: [["Irish"], ["Gaeilge"]],
		ig: [["Igbo"], ["Asụsụ Igbo"]],
		ik: [["Inupiaq"], ["Iñupiaq", "Iñupiatun"]],
		io: [["Ido"], ["Ido"]],
		is: [["Icelandic"], ["Íslenska"]],
		it: [["Italian"], ["Italiano"]],
		iu: [["Inuktitut"], ["ᐃᓄᒃᑎᑐᑦ"]],
		ja: [["Japanese"], ["日本語", "にほんご"]],
		jv: [["Javanese"], ["ꦧꦱꦗꦮ", "Basa Jawa"]],
		kl: [["Kalaallisut", "Greenlandic"], ["Kalaallisut", "Kalaallit Oqaasii"]],
		kn: [["Kannada"], ["ಕನ್ನಡ"]],
		kr: [["Kanuri"], ["Kanuri"]],
		ks: [["Kashmiri"], ["कश्मीरी", "كشميري‎"]],
		kk: [["Kazakh"], ["Қазақ Тілі"]],
		km: [["Central Khmer"], ["ខ្មែរ", "ខេមរភាសា", "ភាសាខ្មែរ"]],
		ki: [["Kikuyu", "Gikuyu"], ["Gĩkũyũ"]],
		rw: [["Kinyarwanda"], ["Ikinyarwanda"]],
		ky: [["Kirghiz", "Kyrgyz"], ["Кыргызча", "Кыргыз Тили"]],
		kv: [["Komi"], ["Коми Кыв"]],
		kg: [["Kongo"], ["Kikongo"]],
		ko: [["Korean"], ["한국어"]],
		ku: [["Kurdish"], ["Kurdî", "کوردی‎"]],
		kj: [["Kuanyama", "Kwanyama"], ["Kuanyama"]],
		la: [["Latin"], ["Latine", "Lingua Latina"]],
		lb: [["Luxembourgish", "Letzeburgesch"], ["Lëtzebuergesch"]],
		lg: [["Ganda"], ["Luganda"]],
		li: [["Limburgan", "Limburger", "Limburgish"], ["Limburgs"]],
		ln: [["Lingala"], ["Lingála"]],
		lo: [["Lao"], ["ພາສາລາວ"]],
		lt: [["Lithuanian"], ["Lietuvių Kalba"]],
		lu: [["Luba-Katanga"], ["Kiluba"]],
		lv: [["Latvian"], ["Latviešu Valoda"]],
		gv: [["Manx"], ["Gaelg", "Gailck"]],
		mk: [["Macedonian"], ["Македонски Јазик"]],
		mg: [["Malagasy"], ["Fiteny Malagasy"]],
		ms: [["Malay"], ["Bahasa Melayu", "بهاس ملايو‎"]],
		ml: [["Malayalam"], ["മലയാളം"]],
		mt: [["Maltese"], ["Malti"]],
		mi: [["Maori"], ["Te Reo Māori"]],
		mr: [["Marathi"], ["मराठी"]],
		mh: [["Marshallese"], ["Kajin M̧ajeļ"]],
		mn: [["Mongolian"], ["Монгол Хэл"]],
		na: [["Nauru"], ["Dorerin Naoero"]],
		nv: [["Navajo", "Navaho"], ["Diné Bizaad"]],
		nd: [["North Ndebele"], ["IsiNdebele"]],
		ne: [["Nepali"], ["नेपाली"]],
		ng: [["Ndonga"], ["Owambo"]],
		nb: [["Norwegian Bokmål"], ["Norsk Bokmål"]],
		nn: [["Norwegian Nynorsk"], ["Norsk Nynorsk"]],
		no: [["Norwegian"], ["Norsk"]],
		ii: [["Sichuan Yi", "Nuosu"], ["ꆈꌠ꒿", "Nuosuhxop"]],
		nr: [["South Ndebele"], ["IsiNdebele"]],
		oc: [["Occitan"], ["Occitan", "Lenga d'Òc"]],
		oj: [["Ojibwa"], ["ᐊᓂᔑᓈᐯᒧᐎᓐ"]],
		cu: [["Church Slavic", "Old Slavonic", "Church Slavonic", "Old Bulgarian", "Old Church Slavonic"], ["Ѩзыкъ Словѣньскъ"]],
		om: [["Oromo"], ["Afaan Oromoo"]],
		or: [["Oriya"], ["ଓଡ଼ିଆ"]],
		os: [["Ossetian", "Ossetic"], ["Ирон Æвзаг"]],
		pa: [["Punjabi", "Panjabi"], ["ਪੰਜਾਬੀ", "پنجابی‎"]],
		pi: [["Pali"], ["पालि", "पाळि"]],
		fa: [["Persian"], ["فارسی"]],
		pl: [["Polish"], ["Język Polski", "Polszczyzna"]],
		ps: [["Pashto", "Pushto"], ["پښتو"]],
		pt: [["Portuguese"], ["Português"]],
		"pt-br": [["Brazilian Portuguese"], ["Português Brasileiro"]],
		"pt-pt": [["Portuguese (Portugal)"], ["Português De Portugal"]],
		qu: [["Quechua"], ["Runa Simi", "Kichwa"]],
		rm: [["Romansh"], ["Rumantsch Grischun"]],
		rn: [["Rundi"], ["Ikirundi"]],
		ro: [["Romanian", "Moldavian", "Moldovan"], ["Română"]],
		ru: [["Russian"], ["Русский"]],
		sa: [["Sanskrit"], ["संस्कृतम्"]],
		sc: [["Sardinian"], ["Sardu"]],
		sd: [["Sindhi"], ["सिन्धी", "سنڌي، سندھی‎"]],
		se: [["Northern Sami"], ["Davvisámegiella"]],
		sm: [["Samoan"], ["Gagana Fa'a Samoa"]],
		sg: [["Sango"], ["Yângâ Tî Sängö"]],
		sr: [["Serbian"], ["Српски Језик"]],
		gd: [["Gaelic", "Scottish Gaelic"], ["Gàidhlig"]],
		sn: [["Shona"], ["ChiShona"]],
		si: [["Sinhala", "Sinhalese"], ["සිංහල"]],
		sk: [["Slovak"], ["Slovenčina", "Slovenský Jazyk"]],
		sl: [["Slovenian"], ["Slovenski Jezik", "Slovenščina"]],
		so: [["Somali"], ["Soomaaliga", "Af Soomaali"]],
		st: [["Southern Sotho"], ["Sesotho"]],
		es: [["Spanish", "Castilian"], ["Español"]],
		su: [["Sundanese"], ["Basa Sunda"]],
		sw: [["Swahili"], ["Kiswahili"]],
		ss: [["Swati"], ["SiSwati"]],
		sv: [["Swedish"], ["Svenska"]],
		ta: [["Tamil"], ["தமிழ்"]],
		te: [["Telugu"], ["తెలుగు"]],
		tg: [["Tajik"], ["Тоҷикӣ", "Toçikī", "تاجیکی‎"]],
		th: [["Thai"], ["ไทย"]],
		ti: [["Tigrinya"], ["ትግርኛ"]],
		bo: [["Tibetan"], ["བོད་ཡིག"]],
		tk: [["Turkmen"], ["Türkmen", "Түркмен"]],
		tl: [["Tagalog"], ["Wikang Tagalog"]],
		tn: [["Tswana"], ["Setswana"]],
		to: [["Tonga"], ["Faka Tonga"]],
		tr: [["Turkish"], ["Türkçe"]],
		ts: [["Tsonga"], ["Xitsonga"]],
		tt: [["Tatar"], ["Татар Теле", "Tatar Tele"]],
		tw: [["Twi"], ["Twi"]],
		ty: [["Tahitian"], ["Reo Tahiti"]],
		ug: [["Uighur", "Uyghur"], ["ئۇيغۇرچە‎", "Uyghurche"]],
		uk: [["Ukrainian"], ["Українська"]],
		ur: [["Urdu"], ["اردو"]],
		uz: [["Uzbek"], ["Oʻzbek", "Ўзбек", "أۇزبېك‎"]],
		ve: [["Venda"], ["Tshivenḓa"]],
		vi: [["Vietnamese"], ["Tiếng Việt"]],
		vo: [["Volapük"], ["Volapük"]],
		wa: [["Walloon"], ["Walon"]],
		cy: [["Welsh"], ["Cymraeg"]],
		wo: [["Wolof"], ["Wollof"]],
		fy: [["Western Frisian"], ["Frysk"]],
		xh: [["Xhosa"], ["IsiXhosa"]],
		yi: [["Yiddish"], ["ייִדיש"]],
		yo: [["Yoruba"], ["Yorùbá"]],
		za: [["Zhuang", "Chuang"], ["Saɯ Cueŋƅ", "Saw Cuengh"]],
		zu: [["Zulu"], ["IsiZulu"]],
	};
	// spell-checker:enable

	function get_iso_language_name(language) {
		return language_names[language][0][0];
	}
	function get_language_endonym(language) {
		return language_names[language][1][0];
	}

	let current_language = base_language;
	for (const accepted_language of accepted_languages) {
		if (available_languages.indexOf(accepted_language) !== -1) {
			current_language = accepted_language;
			break;
		}
	}

	function get_language() {
		return current_language;
	}
	function get_direction(language = current_language) {
		return language.match(/^(ar|dv|fa|ha|he|ks|ku|ms|pa|ps|sd|ug|yi)\b/i) ? "rtl" : "ltr";
	}
	async function load_language(language) {
		// const prev_language = current_language;

		const stylesheets = [...document.querySelectorAll(".flippable-layout-stylesheet")];
		for (const stylesheet of stylesheets) {
			let href = stylesheet.getAttribute("href");
			if (get_direction(language) === "rtl") {
				if (href.indexOf(".rtl.css") === -1) {
					href = href.replace(/\.css$/i, ".rtl.css");
				}
			} else {
				if (href.indexOf(".rtl.css") > -1) {
					href = href.replace(/\.rtl\.css$/i, ".css");
				}
			}
			stylesheet.setAttribute("href", href);
			// hack to wait for stylesheet to load
			const img = document.createElement("img");
			img.onerror = () => {
				$(() => {
					$G.triggerHandler("theme-load"); // signal layout change
				});
			};
			img.src = href;
		}

		if (language === base_language) {
			localizations = {};
			current_language = base_language;
			return;
		}
		// fetch(`localization/${language}/localizations.json`)
		// .then((response)=> response.json())
		// JSONP was used with document.write() before transitioning to ES Modules.
		// ESM allows for dynamic imports, but the localization files are not ES Modules.
		// However, top-level await is the important part, so fetch() can be used instead of dynamic import().
		// This is a good substitute for the synchronous document.write() behavior,
		// as dependent code will be delayed until the data is loaded.
		await fetch(`localization/${language}/localizations.js`)
			.then((response) => response.text())
			.then((text) => {
				return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
			})
			.then((new_localizations) => {
				localizations = new_localizations;
				current_language = language;
			}).catch((error) => {
				show_error_message(`Failed to load localizations for ${language_names[language]}.`, error);
				// current_language = prev_language;
			});
		// const src = `localization/${language}/localizations.js`;
		// document.write(`<script src="${src}"></${""/*(avoiding ending script tag if inlined in HTML)*/}script>`);
	}
	// JSONP callback in the localization files
	// window.loaded_localizations = function loaded_localizations(language, mapping) {
	// 	localizations = mapping;
	// 	current_language = language;
	// }
	function set_language(language) {
		showMessageBox({
			title: "Reload Required",
			message: "The application needs to reload to change the language.",
			buttons: [
				{ label: localize("OK"), value: "reload", default: true },
				{ label: localize("Cancel"), value: "cancel" },
			],
			windowOptions: {
				innerWidth: 450,
			},
		}).then((result) => {
			if (result === "reload") {
				are_you_sure(() => {
					try {
						localStorage[language_storage_key] = language;
						exit_fullscreen_if_ios();
						location.reload();
					} catch (error) {
						show_error_message("Failed to store language preference. Make sure cookies / local storage is enabled in your browser settings.", error);
					}
				});
			}
		});
	}

	data_loaded = load_language(current_language);

	exports.localize = localize;
	exports.set_language = set_language;
	exports.get_language = get_language;
	exports.get_iso_language_name = get_iso_language_name;
	exports.get_language_endonym = get_language_endonym;
	exports.get_language_emoji = get_language_emoji;
	exports.get_direction = get_direction;
	exports.available_languages = available_languages;

	// @TODO: these should come from os-gui.js (new AccessKeys API)
	exports.remove_hotkey = remove_hotkey;
	exports.display_hotkey = display_hotkey;
	exports.get_hotkey = get_hotkey;

})();

await data_loaded;

const { localize, set_language, get_language, get_iso_language_name, get_language_endonym, get_language_emoji, get_direction, available_languages, remove_hotkey, display_hotkey, get_hotkey } = exports;
export { available_languages, display_hotkey, get_direction, get_hotkey, get_iso_language_name, get_language, get_language_emoji, get_language_endonym, localize, remove_hotkey, set_language };

// Global for electron-injected.js
// Electron doesn't support ESM for `preload` when sandboxed
// https://www.electronjs.org/docs/latest/tutorial/esm
// This may expose a race condition, because localize() is not available
// until the localization data is downloaded, but the electron code is
// only using it for error messages, and hopefully those won't occur until
// after the localization data is loaded.
window.localize = localize;
