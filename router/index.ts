// import { getCookie, htmlElement } from '@/common/commons'
import ctxData from '@/common/ctx-data'
import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'

// const getBasePath = () => {
// 	const defaultBasePath = import.meta.env.VITE_APP_PATH
// 	const _basePath = getCookie('_ctx_aviaHub')
// 	console.log({ defaultBasePath, _basePath });
// 	console.log({ _basePath, rs: _basePath ?? defaultBasePath });
// 	return _basePath ?? defaultBasePath
// }


export enum RouterName {
	IbeHome = "IbeHome",
	IbeFlight = "IbeFlight",
	IbeReturnFlight = "IbeReturnFlight",
	// IbeSummary = "IbeSummary",
	IbePassenger = "IbePassenger",
	IbeExtraOption = "IbeExtraOption",
	IbePayment = "IbePayment",
	IbeBookingInfo = "IbeBookingInfo",
}

const router = createRouter({
	// history: createWebHistory(getBasePath()),
	history: createWebHistory(ctxData?.contextPath || import.meta.env.VITE_APP_PATH),
	routes: [

		{
			path: '/',
			redirect: { name: RouterName.IbeHome }
		},
		{
			path: '/secure/ibe/',
			redirect: { name: RouterName.IbeHome }
		},
		{
			path: '/secure/ibe/home',
			name: RouterName.IbeHome,
			component: () => import(/* webpackChunkName: "IbeHome.[hash].js" */ '../views/HomeView.vue')
		},
		{
			path: '/secure/ibe/flights',
			name: RouterName.IbeFlight,
			// route level code-splitting
			// this generates a separate chunk (About.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () =>
				import(/* webpackChunkName: "IbeFlight.[hash].js" */ '../views/FlightView.vue')
		},
		{
			path: '/secure/ibe/return-flights',
			name: RouterName.IbeReturnFlight,
			component: () => import(/* webpackChunkName: "IbeFlightReturn.[hash].js" */ '../views/FlightReturnView.vue')
		},
		// {
		// 	path: '/secure/ibe/summary',
		// 	name: RouterName.IbeSummary,
		// 	component: () => import(/* webpackChunkName: "IbeSummary.[hash].js" */ '../views/SummaryView.vue')
		// },
		{
			path: '/secure/ibe/passengers',
			name: RouterName.IbePassenger,
			component: () => import(/* webpackChunkName: "IbePassenger.[hash].js" */ '../views/PassengerView.vue')
		},
		{
			path: '/secure/ibe/extra-options',
			name: RouterName.IbeExtraOption,
			component: () => import(/* webpackChunkName: "IbeExtraOption.[hash].js" */ '../views/ExtraOptionView.vue')
		},
		{
			path: '/secure/ibe/payment',
			name: RouterName.IbePayment,
			component: () => import(/* webpackChunkName: "IbePayment.[hash].js" */ '../views/PaymentView.vue')
		},
		{
			path: '/secure/ibe/:bookingId(\\d+)/:pnr/bookingInfo',
			name: RouterName.IbeBookingInfo,
			component: () => import(/* webpackChunkName: "IbeBookingInfo.[hash].js" */ '../views/BookingInfo.vue')
		},
	],

	scrollBehavior(/* to, from, savedPosition */) {
		return {top: 0}
	},
})

export default router
