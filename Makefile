REGION ?= us-east-1
STACK_NAME ?= $(USER)-aws-chat
ARTIFACT_BUCKET ?= artifacts-$(USER)-$(REGION)

all: infra.deploy
	@echo "########################################"
	@echo "  Deploy completed"
	@echo "########################################"
	aws cloudformation describe-stacks \
		--region $(REGION) \
		--stack-name $(STACK_NAME)

infra.deploy: infra.lib.layer infra.package
	@echo "########################################"
	@echo "  Deploying Infra"
	@echo "########################################"
	aws cloudformation deploy \
		--region $(REGION) \
		--stack-name $(STACK_NAME) \
		--template output-template.yaml \
		--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \

infra.lib.layer:
	@echo "########################################"
	@echo "     Install Production Dependencies"
	@echo "########################################"
	cd lambdas && \
		rm -rf lib && mkdir -p lib/nodejs && \
		cp package.json lib/nodejs && \
		cd lib/nodejs && npm install --production

infra.package: infra.build infra.artifact-bucket
	@echo "########################################"
	@echo "  Packaging Infra"
	@echo "########################################"
	aws cloudformation package \
		--region $(REGION) \
		--s3-bucket $(ARTIFACT_BUCKET) \
		--template template.yaml \
		--output-template output-template.yaml

infra.build:
	@echo "########################################"
	@echo "  Build Infra"
	@echo "########################################"
	cd lambdas && npm install && npm run compile

infra.artifact-bucket:
	@echo "########################################"
	@echo "  Creating artifact bucket"
	@echo "########################################"
	aws s3api create-bucket \
		--bucket $(ARTIFACT_BUCKET) \
		--region $(REGION)