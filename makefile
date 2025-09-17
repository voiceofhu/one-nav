# 获取当前时间并格式化版本号
VERSION := $(shell TZ="Asia/Shanghai" date +"%y.%m%d.%H%M")

# 检查 npm 是否安装
NPM := $(shell command -v npm 2> /dev/null)
ifeq ($(strip $(NPM)),)
$(error npm is not installed. Please install Node.js and npm)
endif

# 更新版本号，增加错误处理
update-version:
	@if [ -f "package.json" ]; then \
		echo "Updating package.json version to $(VERSION)"; \
		node -e "const fs = require('fs'); \
			const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); \
			pkg.version = '$(VERSION)'; \
			fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));" || \
		(echo "Failed to update package.json"; exit 1); \
	else \
		echo "package.json not found"; \
		exit 1; \
	fi

# 提交版本变更到Git
push-version: update-version
	@echo "Committing version change"
	@git diff --quiet package.json || \
		(git add . && \
		git commit -m "bump version to v$(VERSION)" && \
		git push) || \
		(echo "Git commit failed"; exit 1)

# 创建并推送标签
push-tag: push-version
	@echo "Creating and pushing tag v$(VERSION)"
	@git tag v$(VERSION) && \
		git push origin v$(VERSION) || \
		(echo "Failed to create and push tag"; exit 1)

# 开发环境
dev:
	@$(NPM) run dev

# 开发环境
deploy:
	@$(NPM) run deploy
	
# ===== 压缩相关 =====
ZIP := $(shell command -v zip 2> /dev/null)
ifeq ($(strip $(ZIP)),)
$(error zip is not installed. Please install zip)
endif

EXT_DIR := dist-ext
RELEASE_DIR := release
EXT_ZIP := $(RELEASE_DIR)/ext-$(VERSION).zip

# 扩展: 构建 + 打包 zip（zip 中是 dist-ext 的内容，而不是整层目录）
ext:
	@$(NPM) run build:ext
	@echo "Packaging $(EXT_DIR) -> $(EXT_ZIP)"
	@mkdir -p $(RELEASE_DIR)
	@rm -f $(EXT_ZIP)
	@cd $(EXT_DIR) && \
		$(ZIP) -r "../$(EXT_ZIP)" . \
		-x "*.map" -x "__MACOSX" -x ".*"
	@echo "Done: $(EXT_ZIP)"
	


.PHONY: update-version push-version push-tag dev deploy-stage deploy build