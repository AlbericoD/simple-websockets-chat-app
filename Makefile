REGION ?= us-east-1
STACK_NAME ?= $(USER)-aws-chat
ARTIFACT_BUCKET ?= artifacts-$(USER)-$(REGION)

all: infra.deploy
	@echo "#####################"
	@echo "  Deploy completed"
	@echo "#####################"
	aws cloudformation describe-stacks \
		--region $(REGION) \
		--stack-name $(STACK_NAME)

infra.deploy: infra.package
	@echo "####################"
	@echo "  Deploying Infra"
	@echo "####################"
	aws cloudformation deploy \
		--region $(REGION) \
		--stack-name $(STACK_NAME) \
		--template output-template.yaml \
		--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \


infra.package: infra.artifact-bucket
	@echo "####################"
	@echo "  Packaging Infra"
	@echo "####################"
	aws cloudformation package \
		--region $(REGION) \
		--s3-bucket $(ARTIFACT_BUCKET) \
		--template template.yaml \
		--output-template output-template.yaml

infra.artifact-bucket:
	@echo "\n\n########################################"
	@echo "  Creating artifact bucket"
	@echo "########################################"
	aws s3api create-bucket \
		--bucket $(ARTIFACT_BUCKET) \
		--region $(REGION)