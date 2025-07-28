
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T extends DefineComponent> = T & DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>>
type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = (T & DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }>)
interface _GlobalComponents {
      'CommonBadge': typeof import("../components/common/Badge.vue")['default']
    'CommonButton': typeof import("../components/common/Button.vue")['default']
    'CommonCard': typeof import("../components/common/Card.vue")['default']
    'CommonInput': typeof import("../components/common/Input.vue")['default']
    'CommonLanguageSwitcher': typeof import("../components/common/LanguageSwitcher.vue")['default']
    'CommonLoadingOverlay': typeof import("../components/common/LoadingOverlay.vue")['default']
    'CommonLoadingSpinner': typeof import("../components/common/LoadingSpinner.vue")['default']
    'CommonModal': typeof import("../components/common/Modal.vue")['default']
    'CommonSelect': typeof import("../components/common/Select.vue")['default']
    'CommonTagInput': typeof import("../components/common/TagInput.vue")['default']
    'CommonTextarea': typeof import("../components/common/Textarea.vue")['default']
    'CommonToast': typeof import("../components/common/Toast.vue")['default']
    'LayoutFooter': typeof import("../components/layout/Footer.vue")['default']
    'LayoutHeader': typeof import("../components/layout/Header.vue")['default']
    'OrganizationsInviteMemberModal': typeof import("../components/organizations/InviteMemberModal.vue")['default']
    'NuxtWelcome': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/welcome.vue")['default']
    'NuxtLayout': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
    'NuxtErrorBoundary': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
    'ClientOnly': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/client-only")['default']
    'DevOnly': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/dev-only")['default']
    'ServerPlaceholder': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'NuxtLink': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-link")['default']
    'NuxtLoadingIndicator': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
    'NuxtTime': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
    'NuxtImg': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
    'NuxtPicture': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
    'NuxtPage': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/pages/runtime/page")['default']
    'NoScript': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['NoScript']
    'Link': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Link']
    'Base': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Base']
    'Title': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Title']
    'Meta': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Meta']
    'Style': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Style']
    'Head': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Head']
    'Html': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Html']
    'Body': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Body']
    'NuxtIsland': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-island")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/server-placeholder")['default']
      'LazyCommonBadge': LazyComponent<typeof import("../components/common/Badge.vue")['default']>
    'LazyCommonButton': LazyComponent<typeof import("../components/common/Button.vue")['default']>
    'LazyCommonCard': LazyComponent<typeof import("../components/common/Card.vue")['default']>
    'LazyCommonInput': LazyComponent<typeof import("../components/common/Input.vue")['default']>
    'LazyCommonLanguageSwitcher': LazyComponent<typeof import("../components/common/LanguageSwitcher.vue")['default']>
    'LazyCommonLoadingOverlay': LazyComponent<typeof import("../components/common/LoadingOverlay.vue")['default']>
    'LazyCommonLoadingSpinner': LazyComponent<typeof import("../components/common/LoadingSpinner.vue")['default']>
    'LazyCommonModal': LazyComponent<typeof import("../components/common/Modal.vue")['default']>
    'LazyCommonSelect': LazyComponent<typeof import("../components/common/Select.vue")['default']>
    'LazyCommonTagInput': LazyComponent<typeof import("../components/common/TagInput.vue")['default']>
    'LazyCommonTextarea': LazyComponent<typeof import("../components/common/Textarea.vue")['default']>
    'LazyCommonToast': LazyComponent<typeof import("../components/common/Toast.vue")['default']>
    'LazyLayoutFooter': LazyComponent<typeof import("../components/layout/Footer.vue")['default']>
    'LazyLayoutHeader': LazyComponent<typeof import("../components/layout/Header.vue")['default']>
    'LazyOrganizationsInviteMemberModal': LazyComponent<typeof import("../components/organizations/InviteMemberModal.vue")['default']>
    'LazyNuxtWelcome': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
    'LazyNuxtLayout': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
    'LazyNuxtErrorBoundary': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
    'LazyClientOnly': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/client-only")['default']>
    'LazyDevOnly': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/dev-only")['default']>
    'LazyServerPlaceholder': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyNuxtLink': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
    'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
    'LazyNuxtTime': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
    'LazyNuxtImg': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
    'LazyNuxtPicture': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
    'LazyNuxtPage': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/pages/runtime/page")['default']>
    'LazyNoScript': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
    'LazyLink': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Link']>
    'LazyBase': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Base']>
    'LazyTitle': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Title']>
    'LazyMeta': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Meta']>
    'LazyStyle': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Style']>
    'LazyHead': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Head']>
    'LazyHtml': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Html']>
    'LazyBody': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Body']>
    'LazyNuxtIsland': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export const CommonBadge: typeof import("../components/common/Badge.vue")['default']
export const CommonButton: typeof import("../components/common/Button.vue")['default']
export const CommonCard: typeof import("../components/common/Card.vue")['default']
export const CommonInput: typeof import("../components/common/Input.vue")['default']
export const CommonLanguageSwitcher: typeof import("../components/common/LanguageSwitcher.vue")['default']
export const CommonLoadingOverlay: typeof import("../components/common/LoadingOverlay.vue")['default']
export const CommonLoadingSpinner: typeof import("../components/common/LoadingSpinner.vue")['default']
export const CommonModal: typeof import("../components/common/Modal.vue")['default']
export const CommonSelect: typeof import("../components/common/Select.vue")['default']
export const CommonTagInput: typeof import("../components/common/TagInput.vue")['default']
export const CommonTextarea: typeof import("../components/common/Textarea.vue")['default']
export const CommonToast: typeof import("../components/common/Toast.vue")['default']
export const LayoutFooter: typeof import("../components/layout/Footer.vue")['default']
export const LayoutHeader: typeof import("../components/layout/Header.vue")['default']
export const OrganizationsInviteMemberModal: typeof import("../components/organizations/InviteMemberModal.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const LazyCommonBadge: LazyComponent<typeof import("../components/common/Badge.vue")['default']>
export const LazyCommonButton: LazyComponent<typeof import("../components/common/Button.vue")['default']>
export const LazyCommonCard: LazyComponent<typeof import("../components/common/Card.vue")['default']>
export const LazyCommonInput: LazyComponent<typeof import("../components/common/Input.vue")['default']>
export const LazyCommonLanguageSwitcher: LazyComponent<typeof import("../components/common/LanguageSwitcher.vue")['default']>
export const LazyCommonLoadingOverlay: LazyComponent<typeof import("../components/common/LoadingOverlay.vue")['default']>
export const LazyCommonLoadingSpinner: LazyComponent<typeof import("../components/common/LoadingSpinner.vue")['default']>
export const LazyCommonModal: LazyComponent<typeof import("../components/common/Modal.vue")['default']>
export const LazyCommonSelect: LazyComponent<typeof import("../components/common/Select.vue")['default']>
export const LazyCommonTagInput: LazyComponent<typeof import("../components/common/TagInput.vue")['default']>
export const LazyCommonTextarea: LazyComponent<typeof import("../components/common/Textarea.vue")['default']>
export const LazyCommonToast: LazyComponent<typeof import("../components/common/Toast.vue")['default']>
export const LazyLayoutFooter: LazyComponent<typeof import("../components/layout/Footer.vue")['default']>
export const LazyLayoutHeader: LazyComponent<typeof import("../components/layout/Header.vue")['default']>
export const LazyOrganizationsInviteMemberModal: LazyComponent<typeof import("../components/organizations/InviteMemberModal.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.17.7_@biomejs+biome@2.1.2_@netlify+blobs@9.1.2_@parcel+watcher@2.5.1_@types+node_639a525bd398eaabb93b667a9f677058/node_modules/nuxt/dist/app/components/server-placeholder")['default']>

export const componentNames: string[]
