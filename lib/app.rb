require 'sinatra'

module Artup
  ROOT_DIR = File.expand_path(File.dirname(__FILE__) + "/..")

  class App < Sinatra::Base
    set :app_title, 'Artup'
    set :root, ROOT_DIR

    configure do
      enable :logging
    end

    get '/' do
      redirect uri("index.html")
    end
  end
end