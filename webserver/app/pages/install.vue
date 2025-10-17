<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-gray-900 py-16 sm:py-24">
      <div class="container-lg">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {{ t('install.hero.title') }}
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            {{ t('install.hero.subtitle') }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              @click="copyInstallCommand"
              class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              :aria-label="t('install.hero.quickInstall')"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ t('install.hero.quickInstall') }}
            </Button>
            <a
              href="https://github.com/mattyatea/zxcv/releases"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center px-8 py-3 bg-gray-900 dark:bg-gray-800 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-lg"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {{ t('install.hero.viewReleases') }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Install Section -->
    <section class="py-16 sm:py-20">
      <div class="container-lg">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {{ t('install.quickInstall.title') }}
          </h2>
          <div class="bg-gray-900 dark:bg-gray-800 rounded-xl p-6 mb-8">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm text-gray-400 font-mono">{{ t('install.quickInstall.terminal') }}</span>
              <Button
                @click="copyInstallCommand"
                size="sm"
                variant="ghost"
                class="text-gray-400 hover:text-white"
                :aria-label="t('common.copy')"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {{ t('common.copy') }}
              </Button>
            </div>
            <code class="text-green-400 font-mono text-lg">
              {{ installCommand }}
            </code>
          </div>
          <p class="text-gray-600 dark:text-gray-400 text-center">
            {{ t('install.quickInstall.description') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Installation Methods -->
    <section class="py-16 sm:py-20 bg-gray-50 dark:bg-gray-950">
      <div class="container-lg">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          {{ t('install.methods.title') }}
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div 
            v-for="(method, index) in installMethods" 
            :key="index"
            class="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-800"
          >
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
              <component :is="method.icon" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {{ t(method.titleKey) }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              {{ t(method.descriptionKey) }}
            </p>
            <div class="bg-gray-900 dark:bg-gray-800 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-gray-400 font-mono">{{ t('install.quickInstall.terminal') }}</span>
                <Button
                  @click="copyCommand(method.command)"
                  size="xs"
                  variant="ghost"
                  class="text-gray-400 hover:text-white"
                  :aria-label="t('common.copy')"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </Button>
              </div>
              <code class="text-green-400 font-mono text-sm block break-all">
                {{ method.command }}
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Platform-specific Instructions -->
    <section class="py-16 sm:py-20">
      <div class="container-lg">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          {{ t('install.platforms.title') }}
        </h2>
        <div class="max-w-4xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Button
              v-for="platform in platforms"
              :key="platform.id"
              @click="selectedPlatform = platform.id"
              :class="[
                'p-6 border-2 transition-all',
                selectedPlatform === platform.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              ]"
              variant="ghost"
              :aria-label="`Select ${platform.name} platform`"
            >
              <div class="flex flex-col items-center">
                <component :is="platform.icon" class="w-8 h-8 mb-2" :class="selectedPlatform === platform.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'" />
                <span class="font-semibold" :class="selectedPlatform === platform.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'">
                  {{ platform.name }}
                </span>
              </div>
            </Button>
          </div>
          
          <div class="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-800">
            <div v-for="platform in platforms" :key="platform.id" v-show="selectedPlatform === platform.id">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {{ t(`install.platforms.${platform.id}.title`) }}
              </h3>
              <div class="space-y-4">
                <div v-for="(step, stepIndex) in platform.steps" :key="stepIndex">
                  <h4 class="font-medium text-gray-900 dark:text-white mb-2">
                    {{ stepIndex + 1 }}. {{ t(step.titleKey) }}
                  </h4>
                  <p class="text-gray-600 dark:text-gray-400 mb-3">
                    {{ t(step.descriptionKey) }}
                  </p>
                  <div v-if="step.command" class="bg-gray-900 dark:bg-gray-800 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs text-gray-400 font-mono">{{ t('install.quickInstall.terminal') }}</span>
                      <Button
                        @click="copyCommand(step.command)"
                        size="xs"
                        variant="ghost"
                        class="text-gray-400 hover:text-white"
                        :aria-label="t('common.copy')"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </Button>
                    </div>
                    <code class="text-green-400 font-mono text-sm block break-all">
                      {{ step.command }}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Verification Section -->
    <section class="py-16 sm:py-20 bg-gray-50 dark:bg-gray-950">
      <div class="container-lg">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {{ t('install.verification.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {{ t('install.verification.description') }}
          </p>
          <div class="bg-gray-900 dark:bg-gray-800 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm text-gray-400 font-mono">{{ t('install.quickInstall.terminal') }}</span>
              <Button
                @click="copyCommand(INSTALL_COMMANDS.version)"
                size="sm"
                variant="ghost"
                class="text-gray-400 hover:text-white"
                :aria-label="t('common.copy')"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {{ t('common.copy') }}
              </Button>
            </div>
            <code class="text-green-400 font-mono text-lg">
              {{ INSTALL_COMMANDS.version }}
            </code>
          </div>
        </div>
      </div>
    </section>

    <!-- Next Steps -->
    <section class="py-16 sm:py-20">
      <div class="container-lg">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            {{ t('install.nextSteps.title') }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              v-for="(step, index) in nextSteps" 
              :key="index"
              class="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-800"
            >
              <div class="flex items-start">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span class="text-blue-600 dark:text-blue-400 font-bold text-sm">{{ index + 1 }}</span>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {{ t(step.titleKey) }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 mb-4">
                    {{ t(step.descriptionKey) }}
                  </p>
                  <div v-if="step.command" class="bg-gray-900 dark:bg-gray-800 rounded-lg p-3">
                    <code class="text-green-400 font-mono text-sm">
                      {{ step.command }}
                    </code>
                  </div>
                  <NuxtLink
                    v-if="step.link"
                    :to="step.link"
                    class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-4"
                  >
                    {{ t(step.linkTextKey) }}
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "~/composables/useI18n";
import { useToast } from "~/composables/useToast";

const { t } = useI18n();
const { showToast } = useToast();

const selectedPlatform = ref("auto");

// Install commands - centralized
const INSTALL_COMMANDS = {
	script: "curl -fsSL https://raw.githubusercontent.com/mattyatea/zxcv/main/install.sh | bash",
	version: "zxcv --version",
	binaryLinux: "wget https://github.com/mattyatea/zxcv/releases/latest/download/zxcv-linux-x64",
};

// Install command
const installCommand = INSTALL_COMMANDS.script;

// Copy command function
const copyCommand = async (command: string) => {
	try {
		await navigator.clipboard.writeText(command);
		showToast({
			message: t("common.copied"),
			type: "success",
		});
	} catch (error) {
		console.error("Failed to copy command:", error);
		showToast({
			message: t("install.error.copyFailed"),
			type: "error",
		});
	}
};

const copyInstallCommand = () => copyCommand(installCommand);

// Icons
const TerminalIcon = {
	template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>`,
};

const DownloadIcon = {
	template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>`,
};

const AppleIcon = {
	template: `<svg fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>`,
};

const WindowsIcon = {
	template: `<svg fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 12V6.75l6-1.32v6.48L3 12m17-9v8.75l-10 .15V5.21L20 3M3 13l6 .09v6.81l-6-1.15V13m17 .25V22l-10-1.91V13.1l10 .15z"/>
  </svg>`,
};

const LinuxIcon = {
	template: `<svg fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.504 0c-.155 0-.315.008-.480.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 01-.088.063c-.89.406-1.814.049-2.297-.398-.4-.334-.78-.793-.591-1.404.161-.618.616-.94 1.14-.943v.011zm2.049.382c-.057.016-.133.059-.172.115-.12.17-.068.288-.068.458-.063.256-.175.48-.266.705-.024.06-.024.123-.049.184v.021c-.049.14-.135.27-.202.406-.065.134-.124.271-.183.407-.114.27-.213.54-.320.81-.106.266-.243.532-.357.813-.085.208-.154.427-.268.641-.079.153-.204.5-.66.527-.52.03-.639-.301-.734-.536-.131-.4-.186-.84-.348-1.221-.146-.345-.409-.646-.581-.995-.094-.19-.191-.391-.234-.612-.044-.243.006-.53.146-.758.146-.243.335-.472.538-.671.252-.255.532-.479.807-.716.138-.118.98-.458 1.145-.467zm-2.08 1.932c-.279-.067-.57-.13-.853-.13-.295 0-.576.063-.864.13-.145.033-.289.072-.434.105a3.46 3.46 0 00-.88.297.716.716 0 00-.341.402c-.14.344-.067.718.19.992.257.274.618.402.961.402.344 0 .704-.128.961-.402.257-.274.33-.648.19-.992a.716.716 0 00-.341-.402 3.46 3.46 0 00-.88-.297 8.93 8.93 0 00-.434-.105z"/>
  </svg>`,
};

// Install methods
const installMethods = [
	{
		icon: TerminalIcon,
		titleKey: "install.methods.script.title",
		descriptionKey: "install.methods.script.description",
		command: INSTALL_COMMANDS.script,
	},
	{
		icon: DownloadIcon,
		titleKey: "install.methods.binary.title",
		descriptionKey: "install.methods.binary.description",
		command: INSTALL_COMMANDS.binaryLinux,
	},
];

// Platforms
const platforms = computed(() => [
	{
		id: "auto",
		name: t("install.platforms.auto.name"),
		icon: TerminalIcon,
		steps: [
			{
				titleKey: "install.platforms.auto.steps.1.title",
				descriptionKey: "install.platforms.auto.steps.1.description",
				command: INSTALL_COMMANDS.script,
			},
			{
				titleKey: "install.platforms.auto.steps.2.title",
				descriptionKey: "install.platforms.auto.steps.2.description",
				command: INSTALL_COMMANDS.version,
			},
		],
	},
	{
		id: "macos",
		name: t("install.platforms.macos.name"),
		icon: AppleIcon,
		steps: [
			{
				titleKey: "install.platforms.macos.steps.1.title",
				descriptionKey: "install.platforms.macos.steps.1.description",
				command: INSTALL_COMMANDS.script,
			},
			{
				titleKey: "install.platforms.macos.steps.2.title",
				descriptionKey: "install.platforms.macos.steps.2.description",
				command: "brew install zxcv",
			},
			{
				titleKey: "install.platforms.macos.steps.3.title",
				descriptionKey: "install.platforms.macos.steps.3.description",
			},
		],
	},
	{
		id: "windows",
		name: t("install.platforms.windows.name"),
		icon: WindowsIcon,
		steps: [
			{
				titleKey: "install.platforms.windows.steps.1.title",
				descriptionKey: "install.platforms.windows.steps.1.description",
			},
			{
				titleKey: "install.platforms.windows.steps.2.title",
				descriptionKey: "install.platforms.windows.steps.2.description",
				command: "winget install mattyatea.zxcv",
			},
			{
				titleKey: "install.platforms.windows.steps.3.title",
				descriptionKey: "install.platforms.windows.steps.3.description",
				command: INSTALL_COMMANDS.version,
			},
		],
	},
	{
		id: "linux",
		name: t("install.platforms.linux.name"),
		icon: LinuxIcon,
		steps: [
			{
				titleKey: "install.platforms.linux.steps.1.title",
				descriptionKey: "install.platforms.linux.steps.1.description",
				command: INSTALL_COMMANDS.script,
			},
			{
				titleKey: "install.platforms.linux.steps.2.title",
				descriptionKey: "install.platforms.linux.steps.2.description",
				command: INSTALL_COMMANDS.binaryLinux,
			},
			{
				titleKey: "install.platforms.linux.steps.3.title",
				descriptionKey: "install.platforms.linux.steps.3.description",
				command: INSTALL_COMMANDS.version,
			},
		],
	},
]);

// Next steps
const nextSteps = [
	{
		titleKey: "install.nextSteps.init.title",
		descriptionKey: "install.nextSteps.init.description",
		command: "zxcv init",
	},
	{
		titleKey: "install.nextSteps.auth.title",
		descriptionKey: "install.nextSteps.auth.description",
		command: "zxcv auth login",
	},
	{
		titleKey: "install.nextSteps.explore.title",
		descriptionKey: "install.nextSteps.explore.description",
		link: "/rules",
		linkTextKey: "install.nextSteps.explore.linkText",
	},
	{
		titleKey: "install.nextSteps.help.title",
		descriptionKey: "install.nextSteps.help.description",
		command: "zxcv --help",
	},
];

// SEO
useHead({
	title: t("install.pageTitle"),
	meta: [{ name: "description", content: t("install.pageDescription") }],
});
</script>

<style scoped>
.container-lg {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

code {
  word-break: break-all;
  white-space: pre-wrap;
}

@media (min-width: 640px) {
  .container-lg {
    padding: 0 2rem;
  }
}
</style>