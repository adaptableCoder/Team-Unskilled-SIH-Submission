docker build -t bot .
docker run --rm -it -p 8501:8501 --env-file .env bot
streamlit run bot.py