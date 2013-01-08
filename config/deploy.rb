require 'capistrano/ext/multistage'
load 'deploy' if respond_to?(:namespace) # cap2 differentiator
set :stages, %w(prod)
set :default_stage, "prod"

set :application, "pewpew"
set :node_file, "server.js"

set :repository, "git@github.com:jsonsquared/challenger.io.git"
set :branch, "working"
set :deploy_to, "/www/#{application}"

set :keep_releases, 5
set :scm, :git
set :deploy_via, :remote_cache
set :normalize_asset_timestamps, false
# default_run_options[:shell] = 'bash'

namespace :deploy do
  task :start, :roles => :app, :except => { :no_release => true } do
    run "cd /www/#{application}/current &&./start.sh"
  end

  task :stop, :roles => :app, :except => { :no_release => true } do
    run "cd /www/#{application}/current &&./stop.sh"
  end

#  task :restart, :roles => :app, :except => { :no_release => true } do
#    run "service #{application} restart || service #{application} start"
#  end

  task :restart, :roles => :app, :except => { :no_release => true } do
    run "chmod +x /www/#{application}/current/stop.sh && cd /www/#{application}/current/ && ./stop.sh || false"
    run "chmod +x /www/#{application}/current/start.sh && cd /www/#{application}/current/ && ./start.sh || false"
  end

  # task :init_forever, :roles => :app, :except => { :no_release => true } do
  #   run "chmod +x /www/#{application}/current/start.sh"
  #   run "chmod +x /www/#{application}/current/stop.sh"
  # end

  task :install_dependent_packages, :roles => :app do
    run "cd #{release_path} && npm install --production --quiet"
  end

  task :migrate do
  end
end

after 'deploy:update_code', 'deploy:install_dependent_packages'
# after 'deploy:update_code', 'deploy:init_forever'
after 'deploy', 'deploy:cleanup'